import { formatCurrency, formatDate, formatPeriod } from '../utils/formatter.js';
import { LayoutReport } from './layout.js';

const tableInfo = {
  id: { label: 'CÓDIGO' },
  detail: { colSpan: 6 },
  quantity: { label: 'PEÇAS', colSpan: 2, align: 'right' },
  sales: { label: 'VENDAS', colSpan: 2, align: 'right' }
};

const detailInfo = {
  date: 'Data',
  product: 'Produto',
  customer: 'Cliente',
  group: 'Grupo'
};

export class SalesMapReport extends LayoutReport {
  constructor(params = {}, rows = []) {
    super('Mapa de vendas', params)
    this
      .body(rows)
      .totalizers(rows);
  }

  header() {
    const detailLabel = detailInfo[this.params.detailBy];

    return super
      .header()
      .font(this.fonts.header.strong)
      .text('Período de movimentação: ', { continued: true })
      .font(this.fonts.header.normal, { continued: true })
      .text(formatPeriod(this.params.period), { continued: true })
      .font(this.fonts.header.strong)
      .text('Detalhe: ', this.x + 20, this.y, { continued: true })
      .font(this.fonts.header.normal)
      .text(detailLabel)
      .moveDown(0.5)
      .divider()
      .moveDown(0.5)
      .table({ isHeader: true, data: [[
        { text: tableInfo.id.label, ...tableInfo.id },
        { text: detailLabel.toUpperCase(), ...tableInfo.detail },
        { text: tableInfo.quantity.label, ...tableInfo.quantity },
        { text: tableInfo.sales.label, ...tableInfo.sales },
      ]]})
      .moveDown(0.5);
  }

  body(rows) {
    return this.table({ data:
      [...rows.map(({ id, detail, quantity, sales }) => [
        { text: id, ...tableInfo.id },
        { text: this.params.detailBy == 'date' ? formatDate(detail) : detail, ...tableInfo.detail },
        { text: quantity, ...tableInfo.quantity },
        { text: formatCurrency(sales), ...tableInfo.sales },
      ])]
    })
  }

  totalizers(rows) {
    let totalQuantity = 0, totalSales = 0;

    for(const { quantity, sales } of rows) {
      totalQuantity += quantity, totalSales += sales;
    }

    return this
      .table({ isTotalizer: true, data: [[
        { text: '', ...tableInfo.id },
        { text: '', ...tableInfo.detail },
        { text: totalQuantity, ...tableInfo.quantity },
        { text: formatCurrency(totalSales), ...tableInfo.sales }
      ]] })
  }
}