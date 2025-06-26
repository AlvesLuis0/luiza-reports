export function splitList(list, chunkSize) {
  if (!Array.isArray(list) || chunkSize <= 0) {
    throw new Error('Invalid input: list must be an array and chunkSize must be a positive integer.');
  }

  const result = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    result.push(list.slice(i, i + chunkSize));
  }
  
  return result;
}