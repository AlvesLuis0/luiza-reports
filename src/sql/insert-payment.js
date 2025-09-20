export const insertPaymentSql = `
  INSERT INTO titulos_cr_baixas (
    id_titulo_cr
  , sequencia
  , "DATA"
  , id_formapg
  , valor
  , valor_principal
  , data_hora
  , id_extrato_banco
  )
  VALUES (?, ?, ?, 5, ?, ?, CURRENT_TIMESTAMP, ?)
`;