import dotenv from 'dotenv';
import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';
import { ROOT_PATH } from '../config.js';
import path from 'path';
import { salesMapController } from './controllers/sales-map.js';
import { conciliatorController } from './controllers/conciliator.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.resolve(ROOT_PATH, 'src', 'views'));
app.set('layout', 'layout');
app.use(expressEjsLayouts);

app.use(express.static(path.resolve(ROOT_PATH, 'src', 'public')));

app.get('/', (_, res) => {
  const routines = [
    { path: '/conciliator', label: 'Conciliador' },
    { path: '/sales-map', label: 'Mapa de vendas' },
  ];
  res.render('index', { routines });
});

app.use('/sales-map', salesMapController);
app.use('/conciliator', conciliatorController);

app.listen(PORT, () => {
  console.log(`[INFO] Servidor rodando em http://localhost:${PORT}`);
});