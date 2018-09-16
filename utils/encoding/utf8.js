const isString = require("../validation/is-string");
const isByteArray = require("../validation/is-byte-array");

const encodeTwoBytes = charCode => {
  const byte1 = (charCode >> 6) | 0b11000000;
  const byte2 = (charCode & 0b00111111) | 0b10000000;

  return [byte1, byte2];
};

const encodeThreeBytes = charCode => {
  const byte1 = (charCode >> 12) | 0b11100000;
  const byte2 = ((charCode >> 6) & 0b00111111) | 0b10000000;
  const byte3 = (charCode & 0b00111111) | 0b10000000;

  return [byte1, byte2, byte3];
};

const encodeFourBytes = charCode => {
  const byte1 = (charCode >> 18) | 0b11110000;
  const byte2 = ((charCode >> 12) & 0b00111111) | 0b10000000;
  const byte3 = ((charCode >> 6) & 0b00111111) | 0b10000000;
  const byte4 = (charCode & 0b00111111) | 0b10000000;

  return [byte1, byte2, byte3, byte4];
};

const decodeTwoBytes = (byte1, byte2) =>
  String.fromCharCode(((byte1 & 0b00011111) << 6) | (byte2 & 0b00111111));

const decodeThreeBytes = (byte1, byte2, byte3) =>
  String.fromCharCode(
    ((byte1 & 0b00001111) << 12) |
      ((byte2 & 0b00111111) << 6) |
      (byte3 & 0b00111111)
  );

const decodeFourBytes = (byte1, byte2, byte3, byte4) =>
  String.fromCodePoint(
    ((byte1 & 0b00000111) << 18) |
      ((byte2 & 0b00111111) << 12) |
      ((byte3 & 0b00111111) << 6) |
      (byte4 & 0b00111111)
  );

const encode = text => {
  if (!isString(text)) {
    throw new TypeError("Type must be string for encoding in utf8.");
  }
  const byteArray = [];

  for (const chars of text) {
    const charCode =
      chars.length === 1 ? chars.charCodeAt() : chars.codePointAt();

    if (charCode < 0b10000000) {
      /* 0xxxxxxx */
      byteArray.push(charCode);
    } else if (charCode < 0b100000000000) {
      /* 110xxxxx 10xxxxxx*/
      byteArray.push(...encodeTwoBytes(charCode));
    } else if (charCode < 0b10000000000000000) {
      /* 1110xxxx 10xxxxxx 10xxxxxx*/
      byteArray.push(...encodeThreeBytes(charCode));
    } else {
      /* 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx*/
      byteArray.push(...encodeFourBytes(charCode));
    }
  }

  return new Uint8Array(byteArray);
};

const decode = byteArray => {
  if (!isByteArray(byteArray)) {
    throw new TypeError("Type must be Uint8Array for decoding in utf8.");
  }
  let decodedString = "";

  for (let index = 0; index < byteArray.length; index++) {
    const byte1 = byteArray[index];

    if (byte1 < 0b10000000) {
      /* 0xxxxxxx*/
      decodedString += String.fromCharCode(byte1);
    } else if (byte1 > 0b10111111 && byte1 < 0b11100000) {
      /* 110xxxxx 10xxxxxx */
      decodedString += decodeTwoBytes(byte1, byteArray[index + 1]);
      index += 1;
    } else if (byte1 > 0xdf && byte1 < 0xf0) {
      /* 1110xxxx 10xxxxxx 10xxxxxx */
      decodedString += decodeThreeBytes(
        byte1,
        byteArray[index + 1],
        byteArray[index + 2]
      );
      index += 2;
    } else {
      /* 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx*/
      decodedString += decodeFourBytes(
        byte1,
        byteArray[index + 1],
        byteArray[index + 2],
        byteArray[index + 3]
      );
      index += 3;
    }
  }
  return decodedString;
};

module.exports = {
  encode,
  decode
};
