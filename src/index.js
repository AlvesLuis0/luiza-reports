import dotenv from 'dotenv';
import express from 'express';
import expressEjsLayouts from 'express-ejs-layouts';
import { salesMapController } from './controllers/sales-map.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', './src/views');
app.set('layout', 'layout');
app.use(expressEjsLayouts);

app.use(express.static('./src/public'));

app.get('/', (_, res) => {
  res.render('index');
});

app.use('/sales-map', salesMapController);

app.listen(PORT, () => {
  console.log(`[INFO] Servidor rodando em http://localhost:${PORT}`);
});