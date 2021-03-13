import { Request, Response, Router } from 'express';
import { DBError } from '../server/app';

const router = Router();

router.get('/', function (req: Request, res: Response) {
  let DB_STATUS: string;
  DB_STATUS =
    DBError === null
      ? "<a style='color: green; font-size: 20px; font-weight: bold'>Connected</a>"
      : `<a style='color: red; font-size: 20px; font-weight: bold;'>${DBError}</a> `;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<title>TodayTopic RestFul API Server</title>');
  res.write(
    '<link rel="icon" href="https://www.readlight.me/common/icon.png">'
  );
  res.write('Welcome!<br>This is API Server of TodayTopic<br><br>');
  res.end(`Database Connection : ${DB_STATUS}`);
});

export default router;
