export const pendingTransactionsSql = `
  SELECT 
    c.id_cliente
  , c.razao_social
  , tc.id_titulo_cr
  , COALESCE(tc.vencimento, tc.vencimento_original) AS data_vencimento
  , tc.valor_residual
  FROM titulos_cr tc
  JOIN clientes c ON c.id_cliente = tc.id_cliente
  WHERE tc.id_cliente = ?
    AND tc.id_formapg = 2 -- crediário
    AND tc.status IN ('A', 'P')
  ORDER BY COALESCE(tc.vencimento, tc.vencimento_original), tc.id_titulo_cr
`;