import dotenv from 'dotenv';
import Firebird from 'node-firebird';

dotenv.config();

const options = {
  host: process.env.FB_HOST || 'localhost',
  port: process.env.FB_PORT || 3050,
  database: process.env.FB_DATABASE,
  user: process.env.FB_USER || 'sysdba',
  password: process.env.FB_PASSWORD || 'masterkey',
  lowercase_keys: true,
  role: null,
  pageSize: 4096,
  retryConnectionInterval: 1000,
  blobAsText: false,
  encoding: 'UTF8'
};

export class Database {
  static async query(sql, params = []) {
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

  static async transaction(callback) {
    return new Promise((resolve, reject) => {
      Firebird.attach(options, (err, db) => {
        if (err) return reject(err);

        db.transaction(Firebird.ISOLATION_READ_COMMITTED, async (err, transaction) => {
          if (err) {
            db.detach();
            return reject(err);
          }

          try {
            const result = await callback(transaction);

            transaction.commit((err) => {
              db.detach();
              if (err) return reject(err);
              resolve(result);
            });
          } catch (error) {
            transaction.rollback(() => {
              db.detach();
              reject(error);
            });
          }
        });
      });
    });
  }
}