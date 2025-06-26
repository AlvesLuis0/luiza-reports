import { movementDetailsSql } from './movement-details.js';

function _salesMapSql(detailBy) {
  detailBy = {
    product: { id: 'p.ID_PRODUTO', detail: 'p.DESCRICAO', join: 'JOIN PRODUTOS p ON p.ID_PRODUTO = v.product_id' },
    customer: { id: 'c.ID_CLIENTE', detail: 'c.RAZAO_SOCIAL', join: 'JOIN CLIENTES c ON c.ID_CLIENTE = v.customer_id' },
    date: { id: 'v.movement_date', detail: 'v.movement_date', join: '' },
    group: { id: 'g.ID_GRUPO', detail: 'g.DESCRICAO', join: `
      JOIN PRODUTOS p ON p.ID_PRODUTO = v.product_id
      JOIN GRUPOS g ON g.ID_GRUPO = p.ID_GRUPO
    ` },
  }[detailBy];

  return `
    SELECT
      ${detailBy.id} AS id
    , ${detailBy.detail} AS detail
    , SUM(v.quantity) AS quantity
    , SUM((v.unit_price - v.item_discount_value) * v.quantity) AS sales
    FROM (${movementDetailsSql}) v
    ${detailBy.join}
    WHERE
      v.movement_date BETWEEN ? AND ?
      AND v.operation_type_flag = 'VD'
      AND v.status_flag = 'N'
    GROUP BY ${detailBy.id}, ${detailBy.detail}
  `;
}

export function salesMapSql(detailBy, orderBy) {
  orderBy = {
    id: 'id',
    detail: 'detail',
    quantity: 'quantity DESC',
    sales: 'sales DESC'
  }[orderBy];

  return `
    SELECT * FROM (${_salesMapSql(detailBy)})
    ORDER BY ${orderBy}
  `;
}