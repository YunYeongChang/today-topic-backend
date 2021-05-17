import { Request, Response, Router } from 'express';
import moment from 'moment';
import cron from 'node-cron';

let leftCount: number = 1,
  default_count: number = 1,
  winnerList: Array<String> = [],
  check = {
    minute: 0, // 00분에 작동하려면 0, 매분 check.second초에 작동하려면 60을 입력
    second: 0,
  };

// # 이벤트 환경 설정
const decreaseCount = (userID: string) => {
  winnerList.push(userID);
  leftCount = leftCount - 1;
};

const checkWinner = (userID: string) => {
  return winnerList.includes(userID);
};

const setEnvironment = () => {
  winnerList = [];
  leftCount = default_count;
};

// # 이벤트 참여
const clickRouter = Router(),
  clickHandler = async (req: Request, res: Response) => {
    if (req.query.userID != undefined) req.body.userID = req.query.userID;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    if (!req.body.userID) res.end('login');
    else if (
      moment().minutes() >= check.minute % 60 &&
      moment().seconds() >= check.second % 60
    ) {
      if (checkWinner(req.body.userID)) res.end('already');
      else if (leftCount > 0) {
        decreaseCount(req.body.userID);
        console.log(
          `[Click Event] (${moment().format(
            'yyyy/MM/DD HH:mm:ss.SSS'
          )}) ==> user '${req.body.userID}' get item!`
        );
        res.end('success');
      } else res.end('max');
    } else res.end('pre');
  };
clickRouter.get('/event/click', clickHandler);
clickRouter.post('/event/click', clickHandler);

// # 이벤트 설정
clickRouter.get(
  '/event/set/:key/:value',
  async (req: Request, res: Response) => {
    if (req.params.key === undefined || req.params.value === undefined)
      return res.end('Invalid Parameter Provided');
    if (Number.isNaN(Number(req.params.value)))
      return res.end(`Invalid Parameter Value Input`);

    switch (req.params.key) {
      case 'count':
        default_count = Number(req.params.value);
        return res.end(`New Item Count Setted to ${default_count}!`);
      case 'second':
        check.second = Number(req.params.value);
        return res.end(`Click-Check-Second Setted to ${check.second}!`);
      case 'minute':
        check.minute = Number(req.params.value);
        return res.end(`Click-Check-Minute Setted to ${check.minute}!`);
      case 'winner':
        if (Number(req.params.value) === 0) {
          setEnvironment();
          return res.end('Winner List has been cleared.');
        }
      default:
        return res.end('Unexecutable Command Requested');
    }
  }
);

// # 이벤트 정보 출력
clickRouter.get('/event/info', async (req: Request, res: Response) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<title>Click Event Info</title>');
  res.write(
    '<link rel="icon" href="https://www.multiflex.tk/common/icon.png">'
  );
  res.write(`<br> check minute : ${check.minute}`);
  res.write(`<br> check second : ${check.second}`);
  res.write(`<br> left count : ${leftCount}`);
  res.write(`<br> new item count : ${default_count}`);
  res.write(`<br><br> winners : ${winnerList.length}`);
  winnerList.forEach((winner) => {
    res.write(`<br> -> ${winner}`);
  });
  res.end();
});

// # 이벤트 초기화 Cron Task
cron.schedule('* * * * * *', () => {
  console.log(
    `[Click Event] (${moment().format(
      'yyyy/MM/DD HH:mm:ss.SSS'
    )})  check(minute: ${check.minute}, second: ${
      check.second
    })  /  left : ${leftCount} `
  );
  if (
    (check.minute === 60 && moment().seconds() === check.second) ||
    (moment().minutes() === check.minute && moment().seconds() === check.second)
  ) {
    console.log(
      `\n[Click Event] Winner List : ${winnerList.length === 0 ? 'none' : ''}`
    );
    winnerList.forEach((winner) => {
      console.log(' -> ' + winner);
    });
    console.log(
      `\n[Click Event] (${moment().format(
        'yyyy/MM/DD HH:mm:ss.SSS'
      )}) event rescheduled.`
    );
    setEnvironment();
  }
});

export default {
  clickRouter,
};
