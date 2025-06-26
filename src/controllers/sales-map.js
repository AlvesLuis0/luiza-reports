import { Router } from 'express';
import { Database } from '../services/database.js';
import { salesMapSql } from '../sql/sales-map.js';
import { SalesMapReport } from '../reports/sales-map.js';
import { sendReport } from '../utils/response.js';
import { convertToDate } from '../utils/converter.js';

export const salesMapController = Router();

salesMapController.get('/', async(_, res) => {
  res.render('sales-map');
});

salesMapController.get('/report', async(req, res) => {
  const period = [convertToDate(req.query.initialPeriod), convertToDate(req.query.finalPeriod)];
  const { detailBy, orderBy } = req.query;

  const rows = await Database.query(salesMapSql(detailBy, orderBy), period);
  const report = new SalesMapReport({ period, detailBy, orderBy }, rows);

  sendReport(res, report);
});