export const pendingCustomersSql = `
  SELECT 
    c.id_cliente
  , c.razao_social
  , SUM(tc.valor_residual) AS valor_residual
  FROM titulos_cr tc
  JOIN clientes c ON c.id_cliente = tc.id_cliente
  WHERE tc.id_formapg = 2 -- crediário
    AND tc.status = 'A'
  GROUP BY c.id_cliente, c.razao_social
  ORDER BY c.razao_social, c.id_cliente
`;