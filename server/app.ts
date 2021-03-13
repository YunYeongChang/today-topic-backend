import * as path from 'path';
import * as express_ejs from 'ejs';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import { statSync } from 'fs';
import { config } from 'dotenv';
import { json, urlencoded } from 'express';
import { connect, connection } from 'mongoose';

import router from '../src/index';

const app = express();
let DBError: string | null,
  DBAttempt: number = 0;

statSync(path.join(__dirname, '../env/.env'));
config({ path: path.join(__dirname, '../env/.env') });

app.use(cors());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', router);
app.engine('html', express_ejs.renderFile);

const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

//#DATABASE CONNECT FUNCTION
const DBConnect = (): void => {
  connect(
    `mongodb://${process.env.DB_USER_ID}:${process.env.DB_USER_PW}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=${process.env.DB_AUTH_USER_DB}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
    .then(() => {
      DBAttempt = 0;
      DBError = null;
      console.log(`[DB] Database connected on port ${process.env.DB_PORT}`);
    })
    .catch((err) => {
      DBError = err.toString();
      console.log(DBError);
    });
};

connection.on(
  'disconnected',
  async (): Promise<void> => {
    console.log(
      `[DB] Database disconnected. Trying to reconnect... (${DBAttempt++})`
    );
    DBError = 'disconnected';
    await delay(1000);
    DBConnect();
  }
);

DBConnect();
export { app, DBError, delay };
