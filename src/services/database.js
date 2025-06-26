import dotenv from 'dotenv';
import Firebird from 'node-firebird';

dotenv.config();

const options = {
  host: process.env.FB_HOST || 'localhost',
  port: process.env.FB_PORT || 3050,
  database: process.env.FB_DATABASE,
  user: process.env.FB_USER,
  password: process.env.FB_PASSWORD,
  lowercase_keys: true,
  role: null,
  pageSize: 4096,
  retryConnectionInterval: 1000,
  blobAsText: false,
  encoding: 'UTF8'
};

const pool = Firebird.pool(5, options);

export class Database {
  static async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      pool.get((err, client) => {
        if (err) return reject(err);

        client.query(sql, params, (err, result) => {
          client.detach();

          if (err) return reject(err);

          resolve(result);
        });
      });
    });
  }
}