export const pendingTransactionsSql = `
  SELECT 
    tc.id_cliente
  , tc.id_titulo_cr
  , COALESCE(tc.vencimento, tc.vencimento_original) AS data_vencimento
  , tc.valor_residual
  FROM titulos_cr tc
  WHERE tc.id_cliente = ?
    AND tc.id_formapg = 2 -- crediário
    AND tc.status = 'A'
  ORDER BY COALESCE(tc.vencimento, tc.vencimento_original)
`;