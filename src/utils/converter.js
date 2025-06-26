export function convertToDate(string) {
  const date = string.split('-');
  return new Date(date[0], date[1] - 1, date[2]);
}