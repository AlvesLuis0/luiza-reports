import { Router } from 'express';
import multer from 'multer';
import { ImportExtractUseCase } from '../use-cases/import-extract.js';
import { Database } from '../services/database.js';
import { transactionsRegisteredSql } from '../sql/transactions-registered.js'
import { PreConciliateUseCase } from '../use-cases/pre-conciliate.js';
import { pendingTransactionsSql } from '../sql/pending-transactions.js';

export const conciliatorController = Router();
const upload = multer({ storage: multer.memoryStorage() });

conciliatorController.get('/', async(_, res) => {
  res.render('conciliator');
});

conciliatorController.get('/pending-transactions', async(_, res) => {
  const result = await Database.query(pendingTransactionsSql(true));
  res.json(result);
});

conciliatorController.post('/import-extract', upload.array('files'), async(req, res) => {
  const result = [];
  const identifiers = new Set((await Database.query(transactionsRegisteredSql)).map(i => i.identifiers));

  for(const file of req.files) {
    const importExtract = new ImportExtractUseCase(file, identifiers);
    result.push(...await importExtract.execute());
  }

  res.json(result)
});

// TODO: ver o que fazer com isso depois
conciliatorController.post('/pre-conciliate', async(req, res) => {
  const conciliation = req.body;
  const preConciliate = new PreConciliateUseCase(conciliation.customer, conciliation.total);
  const history = await preConciliate.execute();
  res.json({ ...conciliation, history });
});