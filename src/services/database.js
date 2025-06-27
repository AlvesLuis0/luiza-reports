import dotenv from 'dotenv';
import Firebird from 'node-firebird';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_PATH = path.resolve(__dirname, '../../storage', 'database.fdb');
const ORIGINAL_PATH = process.env.FB_DATABASE;

function createDatabaseCopy() {
  fs.copyFileSync(ORIGINAL_PATH, STORAGE_PATH);
}

const options = {
  host: process.env.FB_HOST || 'localhost',
  port: process.env.FB_PORT || 3050,
  database: STORAGE_PATH,
  user: process.env.FB_USER,
  password: process.env.FB_PASSWORD,
  lowercase_keys: true,
  role: null,
  pageSize: 4096,
  retryConnectionInterval: 1000,
  blobAsText: false,
  encoding: 'UTF8',
  copyDatabase: Number(process.env.FB_COPY_DATABASE || 1)
};

export class Database {
  static async query(sql, params = []) {
    if(options.copyDatabase) {
      createDatabaseCopy();
    }

    return new Promise((resolve, reject) => {
      Firebird.attach(options, (err, db) => {
        if (err) return reject(err);

        db.query(sql, params, (err, result) => {
          db.detach();

          if (err) return reject(err);

          resolve(result);
        });
      });
    });
  }
}