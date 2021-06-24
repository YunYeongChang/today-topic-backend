from urllib.request import urlopen, Request
from bs4 import BeautifulSoup
from konlpy.tag import Hannanum
from wordcloud import WordCloud, STOPWORDS
from PIL import Image

import matplotlib.pyplot as plt
import platform
import numpy as np
import re
import sys
import random
import string

# matplotlib 한글 폰트설정
#path = "C:\\Windows\\Fonts\\malgun.ttf"
#from matplotlib import font_manager, rc

#if platform.system() == 'Darsin':
#    rc('font', family='AppleGothic')
#elif platform.system() == 'Windows':
#    font_name = font_manager.FontProperties(fname=path).get_name()
#    rc('font', family=font_name)
#else:
#    print('Unknown OS..')

global Text
global link
Text = ""
link = []
theme = {
    "정치일반": {
        "sid1": "100",
        "sid2": "269"
    },
    "북한": {
        "sid1": "100",
        "sid2": "268"
    },
    "금융": {
        "sid1": "101",
        "sid2": "259"
    },
    "증권": {
        "sid1": "101",
        "sid2": "258"
    },
    "부동산": {
        "sid1": "101",
        "sid2": "260"
    },
    "경제일반": {
        "sid1": "101",
        "sid2": "263"
    },
    "세계일반": {
        "sid1": "104",
        "sid2": "322"
    },
    "아시아-호주": {
        "sid1": "104",
        "sid2": "231"
    },
    "미국-중남미": {
        "sid1": "104",
        "sid2": "232"
    },
    "유럽": {
        "sid1": "104",
        "sid2": "233"
    },
    "중동-아프리카": {
        "sid1": "104",
        "sid2": "234"
    },
    "IT일반": {
        "sid1": "105",
        "sid2": "230"
    },
    "과학일반": {
        "sid1": "104",
        "sid2": "228"
    }
}
han = Hannanum()
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36'}


# 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36'

def make_link(keyword, page_num):
    return "https://news.naver.com/main/list.nhn?mode=LS2D&mid=shm&sid1=" \
           + theme[keyword]["sid1"] + "&sid2=" + theme[keyword]["sid2"] + "date=20210615" + "&page=" + page_num


# https://news.naver.com/main/list.nhn?mode=LS2D&mid=shm&sid2=269&sid1=100&date=20210615&page=1

def return_link_list(url):
    html = urlopen(Request(url, headers=headers))
    bs = BeautifulSoup(html.read(), "html.parser")
    Headline = bs.findAll("li", "")
    link_list = []
    for item in Headline:
        try:
            if (item.find("span", "writing") != None):
                link = item.find("a").attrs["href"]
                link_list.append(link)
        except AttributeError:
            continue
    return link_list


def parse_content(link):
    html = urlopen(Request(link, headers=headers))
    bs = BeautifulSoup(html.read(), "html.parser")
    C_Text = ""
    title = bs.find("h3", {"id": "articleTitle"}).get_text(strip=True)
    han.nouns(title)
    for i in han.nouns(title):
        C_Text += i + " "
    # print(title)
    # print(link)
    content = bs.find('div', {'id': "articleBodyContents"}).get_text(strip=True)

    content = re.sub("//(.+)", "", content)
    content = re.sub("function(.+)\(\)", "", content)
    content = re.sub("▶(.+)", "", content)
    content = re.sub("[A-Za-z0-9\.+_]+@[A-Za-z0-9]+\.(com|net|org|kr)", "", content)
    content = re.sub("[0-9][명|일]", "", content)

    global Text
    Text += C_Text

    for i in han.nouns(content):
        # print(i)
        Text = Text + i + " "
    # print(Text)

    # url = "https://news.naver.com/main/read.nhn?mode=LS2D&mid=shm&sid1=100&sid2=268&oid=421&aid=0004800349"
    # parse_content(url)


def parse_max_page_number(url):
    html = urlopen(Request(url, headers=headers))
    bs = BeautifulSoup(html.read(), "html.parser")
    paging = bs.find("div", {"class": "paging"})
    print(paging)
    max_page_num = paging.find("strong").get_text(strip=True)

    return max_page_num


keyword = sys.argv[1] # 실행할 때 키워드 매개변수로 입력받기
# print(parse_max_page_number(make_link(keyword, "110")))

for i in range(1, 5):
    link = link + return_link_list(make_link(keyword, str(i)))

# link = return_link_list(make_link(keyword, "1"))

for i in link:
    parse_content(i)
mask_image = np.array(Image.open("./src/keyword/" + keyword + ".png"))

stopwords = set(STOPWORDS)
# 공통
stopwords.add("뉴스")
stopwords.add("신문")
stopwords.add("보도 사진")
stopwords.add("사진")
stopwords.add("결과")
stopwords.add("재배포")
stopwords.add("사용가능")
stopwords.add("오후")
stopwords.add("지난해")

stopwords.add("이날")
stopwords.add("것")
stopwords.add("등")
stopwords.add("수")
stopwords.add("이")
stopwords.add("중")
stopwords.add("경우")
stopwords.add("말")
stopwords.add("올해")
stopwords.add("그")
stopwords.add("이야기")
stopwords.add("데")
stopwords.add("강조")
stopwords.add("이번")

# 정치일반
stopwords.add("저")
stopwords.add("고")
stopwords.add("의원")
stopwords.add("후보")
stopwords.add("며")
stopwords.add("전")
stopwords.add("당")

# 증권
stopwords.add("발생")

# 경제 일반
stopwords.add("조")
stopwords.add("원")
stopwords.add("때")
stopwords.add("때문")
stopwords.add("상대방")
stopwords.add("생각")

# 북한
stopwords.add("북한")

# 부동산
stopwords.add("시")

# IT 일반
stopwords.add("사업")
stopwords.add("기능")
stopwords.add("출시")
stopwords.add("기")
stopwords.add("기술")
stopwords.add("제품")
stopwords.add("제공")

# 바 수 터 게 마리 채 체 듯 냥 뿐 만큼 대로 (의존 명사 모음)

# print(Text)
# content

# content = re.sub("▶(.+)","",content)
# content = re.sub("[A-Za-z0-9\.+_]+@[A-Za-z0-9]+\.(com|net|org|kr)","",content)
# #print(content)
# print(han.pos(content))

wc = WordCloud(font_path="./src/keyword/BMDOHYEON_ttf.ttf", background_color='white', max_words=1000, mask=mask_image,
               stopwords=stopwords)
wc = wc.generate(Text)
from wordcloud import ImageColorGenerator

image_colors = ImageColorGenerator(mask_image)

fig = plt.figure(figsize=(12, 12))
plt.imshow(wc.recolor(color_func=image_colors), interpolation='bilinear')
# plt.show()
# print(result)

length = 8
string_pool = string.digits
randnum = ""
for i in range(length):
    randnum += random.choice(string_pool)

file_path = 'result_' + str(randnum) + '.png';

wc.to_file('/var/todaytopic/frontend/image/' + file_path)
print(file_path)
# sys.stdout.flush()