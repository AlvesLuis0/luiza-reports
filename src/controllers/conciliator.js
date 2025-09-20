import { Router } from 'express';
import multer from 'multer';
import { ImportExtractUseCase } from '../use-cases/import-extract.js';
import { Database } from '../services/database.js';
import { transactionsRegisteredSql } from '../sql/transactions-registered.js';
import { PreConciliateUseCase } from '../use-cases/pre-conciliate.js';
import { pendingCustomersSql } from '../sql/pending-customers.js';
import { ConciliateUseCase } from '../use-cases/conciilate.js';

export const conciliatorController = Router();
const upload = multer({ storage: multer.memoryStorage() });

conciliatorController.get('/', async(_, res) => {
  res.render('conciliator');
});

conciliatorController.get('/pending-customers', async(_, res) => {
  const result = await Database.query(pendingCustomersSql);
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

conciliatorController.post('/pre-conciliate', async(req, res) => {
  const conciliation = req.body;
  const preConciliate = new PreConciliateUseCase(conciliation.customer, conciliation.transactions);
  const history = await preConciliate.execute();
  res.json({ ...conciliation, history });
});

conciliatorController.post('/conciliate', async(req, res) => {
  const conciliation = req.body;
  const conciliate = new ConciliateUseCase(conciliation.history, conciliation.transactions);
  try {
    const ids = await conciliate.execute();
    const message = `Baixas criadas: ${ids.join(', ')}`;
    res.json({ message });
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});