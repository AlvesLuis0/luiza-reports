export const pendingCustomersSql = `
  SELECT 
    c.id_cliente
  , c.razao_social
  , sum(tc.valor_residual) as valor_residual
  FROM titulos_cr tc
  JOIN clientes c ON c.id_cliente = tc.id_cliente
  WHERE tc.id_formapg = 2
    AND tc.status = 'A'
  GROUP BY c.id_cliente, c.razao_social
`;