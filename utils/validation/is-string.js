const isString = value =>
  // eslint-disable-next-line no-undefined
  value !== undefined && (typeof value === "string" || value instanceof String);

module.exports = isString;
