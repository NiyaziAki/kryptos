const isByteArray = value =>
  // eslint-disable-next-line no-undefined
  value !== undefined &&
  value.constructor === Uint8Array &&
  // eslint-disable-next-line no-undefined
  value.byteLength !== undefined;

module.exports = isByteArray;
