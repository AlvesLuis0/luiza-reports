import { Report } from '../services/report.js';
import { splitList } from '../utils/array.js';
import { formatTimestamp } from '../utils/formatter.js';

export class LayoutReport extends Report {
  constructor(reportTitle = 'Relatório', params = {}) {
    super({ margins: [21, 15] })

    this.params = params;
    
    this.info.Title = reportTitle;
    
    this.headerInfo = {
      establishmentName: 'Luiza Adélia Boutique',
      reportTitle,
      currentDate: new Date(),
      currentPage: 1
    };

    this.footerInfo = {
      version: process.env.npm_package_version
    };

    this.fonts = {
      header: { normal: 'Helvetica', strong: 'Helvetica-Bold' },
      table: { normal: 'Courier', strong: 'Courier-Bold' }
    };

    this.on('pageAdded', () => {
      this.headerInfo.currentPage++;
      this.header();
      this.footer();
    });

    this
      .header()
      .footer();
  }

  header() {
    const { establishmentName, reportTitle, currentDate } = this.headerInfo;
    const currentPage = `Página ${this.headerInfo.currentPage}`;
    const currentDatetime = formatTimestamp(currentDate);

    return this
      .font(this.fonts.header.strong, 12)
      .text(establishmentName)
      .fontSize(10)
      .text(reportTitle)
      .font(this.fonts.header.normal, 8)
      .text(currentPage, this.x, this.page.margins.top, { align: 'right' })
      .text(currentDatetime, { align: 'right' })
      .moveDown()
      .divider()
      .moveDown(0.5);
  }

  footer() {
    const oldCoordinates = [this.x, this.y];
    const newY = this.page.height - this.page.margins.bottom - 10;
    const projectVersion = `Luiza Reports - Versão ${this.footerInfo.version}`;

    this
      .divider(newY - 4)
      .font(this.fonts.header.normal, 8)
      .text(projectVersion, this.x, newY);

    [this.x, this.y] = oldCoordinates;

    return this;
  }

  table({ chunkSize = 50, isHeader = false, isTotalizer = false, data = [] }) {
    const chunks = splitList(data, chunkSize);
    let font, border;
    
    if(isHeader) {
      font = this.fonts.table.strong;
      border = [0,0,1,0];
    } else if(isTotalizer) {
      font = this.fonts.table.strong;
      border = [1,0,0,0];
    } else {
      font = this.fonts.table.normal;
      border = false;
    }
    

    chunks.forEach((chunk, index) => {
      if (index > 0) this.addPage();

      this.font(font)
      super.table({
        columnStyles: { border },
        data: chunk,
      });
    })

    return this;
  }
}