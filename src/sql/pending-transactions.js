export function pendingTransactionsSql(all = false) {
  return `
    SELECT 
      c.id_cliente
    , c.razao_social
    , tc.id_titulo_cr
    , COALESCE(tc.vencimento, tc.vencimento_original) AS data_vencimento
    , tc.valor_residual
    FROM titulos_cr tc
    JOIN clientes c ON c.id_cliente = tc.id_cliente
    WHERE (1=1)
      ${all ? '' : 'AND tc.id_cliente = ?'}
      AND tc.id_formapg = 2 -- crediário
      AND tc.status = 'A'
    ORDER BY c.razao_social, c.id_cliente, COALESCE(tc.vencimento, tc.vencimento_original)
  `;
}