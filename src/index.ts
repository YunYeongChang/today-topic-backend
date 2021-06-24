import { Request, Response, Router } from 'express';
import { DBError } from '../server/app';
import { Options, PythonShell } from 'python-shell';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const DB_STATUS =
    DBError === null
      ? "<a style='color: green; font-size: 20px; font-weight: bold'>Connected</a>"
      : `<a style='color: red; font-size: 20px; font-weight: bold;'>${DBError}</a> `;

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<title>TodayTopic RestFul API Server</title>');
  res.write('<link rel="icon" href="https://www.multiflex.tk/common/icon.png">');
  res.write('Welcome!<br>This is API Server of TodayTopic<br><br>');
  res.end(`Database Connection : ${DB_STATUS}`);
});

router.post('/topic', (req: Request, res: Response) => {
  let data = '정치일반';
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (req.body.data !== undefined) data = String(req.body.data);
  if (data == '1') data = '정치일반';
  if (data == '2') data = 'IT일반';
  if (data == '3') data = '부동산';
  if (data == '4') data = '증권';
  if (data == '5') data = '북한';
  console.log(`Request : ${data}`);

  const options: Options = {
    mode: 'text',
    pythonOptions: ['-u'],
    args: [data],
  };
  PythonShell.run('./src/keyword/data.py', options, (err1, results) => {
    if (err1 || results === undefined) throw err1;

    console.log('results: %j', results);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    res.end(String(results?.length > 0 ? results[0] : 'error.png'));
  });
});

export default router;
