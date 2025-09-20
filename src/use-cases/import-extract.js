import ofx from 'ofx-js'

export class ImportExtractUseCase {
  constructor(file, identifiers) {
    this.file = file;
    this.identifiers = identifiers;
  }

  async execute() {
    const text = this.file.buffer.toString('utf8');
    const ofxData = (await ofx.parse(text)).OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS;
    const result = [];

    const conta = ofxData.BANKACCTFROM.ACCTID;
    const banco = ofxData.BANKACCTFROM.BANKID;

    for(const transaction of ofxData.BANKTRANLIST.STMTTRN) {
      const isCredit = transaction.TRNTYPE == 'CREDIT';
      const isPix = transaction.MEMO.startsWith('Transfe Pix');
      const alreadyRegistered = this.identifiers.has(transaction.FITID);

      if(!isCredit || !isPix || alreadyRegistered) continue;

      result.push({
        banco,
        conta,
        data_emissao: parseOfxDate(transaction.DTPOSTED),
        descricao: transaction.MEMO,
        documento: transaction.CHECKNUM,
        id_extrato_banco: transaction.FITID,
        tipo: transaction.TRNTYPE,
        valor: parseFloat(transaction.TRNAMT),
      });
      this.identifiers.add(transaction.FITID);
    }

    return result;
  }
}

function parseOfxDate(date) {
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  return `${year}-${month}-${day}`;
}