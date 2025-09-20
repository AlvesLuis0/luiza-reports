export const insertExtractBankSql = `
  INSERT INTO extrato_banco (
    id_extrato_banco
  , banco
  , conta
  , data_emissao
  , descricao
  , documento
  , tipo
  , valor
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;