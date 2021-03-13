import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', function (req: Request, res: Response) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<title>TodayTopic RestFul API Server</title>');
  res.write(
    '<link rel="icon" href="https://www.readlight.me/common/icon.png">'
  );
  res.write('Welcome!<br>This is API Server of TodayTopic<br><br>');
  res.end('API Document is <a href="https://api.readlight.me/docs">HERE</a>');
});

export default router;
