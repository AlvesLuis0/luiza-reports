export const pendingTransactionsSql = `
  SELECT 
    c.id_cliente
  , c.razao_social
  , tc.id_titulo_cr
  , COALESCE(tc.vencimento, tc.vencimento_original) AS data_vencimento
  , tc.valor_residual
  , COALESCE(MAX(tcb.sequencia), 0) + 1 AS proxima_sequencia
  FROM titulos_cr tc
  JOIN clientes c ON c.id_cliente = tc.id_cliente
  LEFT JOIN titulos_cr_baixas tcb ON tcb.id_titulo_cr = tc.id_titulo_cr
  WHERE tc.id_cliente = ?
    AND tc.id_formapg = 2 -- crediário
    AND tc.status IN ('A', 'P')
  GROUP BY
    c.id_cliente
  , c.razao_social
  , tc.id_titulo_cr
  , tc.vencimento
  , tc.vencimento_original
  , tc.valor_residual
  ORDER BY COALESCE(tc.vencimento, tc.vencimento_original), tc.id_titulo_cr
`;