export function sendReport(res, report) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${report.headerInfo.reportTitle}.pdf"`);
  report.pipe(res);
  report.end();
}