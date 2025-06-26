import PDFDocument from 'pdfkit';

export class Report extends PDFDocument {
  /**
   * @param {PDFKit.PDFDocumentOptions} options 
   */
  constructor(options) {
    super(options);
  }

  divider(y = this.y) {
    return this
      .moveTo(this.page.margins.left, y)
      .lineTo(this.page.width - this.page.margins.right, y)
      .stroke()
  }
}