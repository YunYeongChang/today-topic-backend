import { Request, Response, Router } from 'express';
import moment from 'moment';
import cron, { ScheduledTask } from 'node-cron';

let leftCount: number = 1,
  default_count: number = 1,
  winnerList: Array<String> = [],
  checkSecond: number = 0;

const decreaseCount = (userID: string) => {
  winnerList.push(userID);
  leftCount = leftCount - 1;
};

const checkWinner = (userID: string) => {
  return winnerList.includes(userID);
};

const setEnvironment = (default_count: number) => {
  winnerList = [];
  leftCount = default_count;
};

const clickRouter = Router(),
  clickHandler = async (req: Request, res: Response) => {
    if (req.query.userID != undefined) req.body.userID = req.query.userID;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    if (!req.body.userID) res.end('login');
    else if (moment().seconds() >= checkSecond) {
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

clickRouter.get(
  '/event/set/:key/:value',
  async (req: Request, res: Response) => {
    if (req.params.key === undefined || req.params.value === undefined)
      return res.end('Invalid Parameter Provided');
    if (Number.isNaN(Number(req.params.value)))
      return res.end(`Invalid Parameter Value Input`);

    if (req.params.key === 'count') {
      default_count = Number(req.params.value);
      res.end(`New Item Count Setted to ${default_count}!`);
    } else if (req.params.key === 'check') {
      checkSecond = Number(req.params.value);
      schedule.stop();
      schedule = cron.schedule(
        (checkSecond === 0 ? 59 : checkSecond - 1) + ' * * * * *',
        scheduledTask
      );
      res.end(`Click-Check-Second Setted to ${checkSecond}!`);
    } else res.end('Unexecutable Command Requested');
  }
);

clickRouter.get('/event/info', async (req: Request, res: Response) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<title>Click Event Info</title>');
  res.write(
    '<link rel="icon" href="https://www.multiflex.tk/common/icon.png">'
  );
  res.write(`<br> left count : ${leftCount}`);
  res.write(`<br> new item count : ${default_count}`);
  res.write(`<br><br> winners : ${winnerList.length}`);
  winnerList.forEach((winner) => {
    res.write(`<br> -> ${winner}`);
  });
  res.end();
});

const scheduledTask = () => {
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
  setEnvironment(default_count);
};

let schedule: ScheduledTask = cron.schedule(
  (checkSecond === 0 ? 59 : checkSecond - 1) + ' * * * * *',
  scheduledTask
);

cron.schedule('* * * * * *', () => {
  console.log(
    `[Click Event] (${moment().format(
      'yyyy/MM/DD HH:mm:ss.SSS'
    )}) left : ${leftCount}  check : ${checkSecond}`
  );
});

export default {
  clickRouter,
};
