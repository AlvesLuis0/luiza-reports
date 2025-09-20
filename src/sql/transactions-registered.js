export const transactionsRegisteredSql = `
  SELECT id_extrato_banco AS identifiers
  FROM extrato_banco
  WHERE situacao = 'N'
`;