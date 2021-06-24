import * as path from 'path';
import { renderFile } from 'ejs';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import { statSync } from 'fs';
import { config } from 'dotenv';
import { json, urlencoded } from 'express';
import { connect, connection } from 'mongoose';

import router from '../src/index';
import clickService from '../src/clickService';

const app = express();
let DBError: string | null,
  DBAttempt = 0;

//OPEN LOCAL ENV FILE WHEN NOT RUNNING IN CI/CD
if (!process.env.RUN_IN_CI_CD) {
  statSync(path.join(__dirname, '../env/.env'));
  config({ path: path.join(__dirname, '../env/.env') });
}

app.use(cors());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', router);
app.use('/', clickService.clickRouter);
app.engine('html', (path) => {
  void renderFile(path);
});

const connectInfo = {
  id: process.env.DB_USER_ID || '',
  pw: process.env.DB_USER_PW || '',
  host: process.env.DB_HOST || '',
  port: process.env.DB_PORT || '',
  name: process.env.DB_NAME || '',
  auth: process.env.DB_AUTH_USER_DB || '',
};
//#DATABASE CONNECT FUNCTION
const DBConnect = (): void => {
  connect(
    `mongodb://${connectInfo.id}:${connectInfo.pw}@${connectInfo.host}:${connectInfo.port}/${connectInfo.name}?authSource=${connectInfo.auth}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
    .then(() => {
      DBAttempt = 0;
      DBError = null;
      console.log(`[DB] Database connected on port ${connectInfo.port}`);
    })
    .catch((reason: any) => {
      DBError = String(reason);
      console.log(DBError);
    });
};

connection.on('disconnected', () => {
  console.log(`\n[DB] Database disconnected. Trying to reconnect... (${DBAttempt++})`);
  DBError = 'disconnected';
  setTimeout(DBConnect, 1000);
});

DBConnect();
export { app, DBError };
