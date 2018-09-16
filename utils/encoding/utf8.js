const isString = require("../validation/is-string");
const isByteArray = require("../validation/is-byte-array");

const getCharCode = chars => {
  if (chars.length === 1) {
    return chars.charCodeAt();
  }
  return chars.codePointAt();
};

const encodeFourBytes = (byteArray, charCode) => {
  /* 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx*/
  const byte1 = (charCode >> 18) | 0b11110000;
  const byte2 = ((charCode >> 12) & 0b00111111) | 0b10000000;
  const byte3 = ((charCode >> 6) & 0b00111111) | 0b10000000;
  const byte4 = (charCode & 0b00111111) | 0b10000000;

  byteArray.push(byte1);
  byteArray.push(byte2);
  byteArray.push(byte3);
  byteArray.push(byte4);
};

const encodeThreeBytes = (byteArray, charCode) => {
  if (charCode < 0b10000000000000000) {
    /* 1110xxxx 10xxxxxx 10xxxxxx*/
    const byte1 = (charCode >> 12) | 0b11100000;
    const byte2 = ((charCode >> 6) & 0b00111111) | 0b10000000;
    const byte3 = (charCode & 0b00111111) | 0b10000000;

    byteArray.push(byte1);
    byteArray.push(byte2);
    byteArray.push(byte3);
  } else {
    encodeFourBytes(byteArray, charCode);
  }
};

const encodeTwoBytes = (byteArray, charCode) => {
  if (charCode < 0b100000000000) {
    /* 110xxxxx 10xxxxxx*/
    const byte1 = (charCode >> 6) | 0b11000000;
    const byte2 = (charCode & 0b00111111) | 0b10000000;

    byteArray.push(byte1);
    byteArray.push(byte2);
  } else {
    encodeThreeBytes(byteArray, charCode);
  }
};

const encodeBytes = (byteArray, charCode) => {
  if (charCode < 0b10000000) {
    /* 0xxxxxxx */
    byteArray.push(charCode);
  } else {
    encodeTwoBytes(byteArray, charCode);
  }
};

const decodeFourBytes = (byteArray, index) => {
  /* 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx*/
  const byte1 = byteArray[index];
  const byte2 = byteArray[index + 1];
  const byte3 = byteArray[index + 2];
  const byte4 = byteArray[index + 3];

  return [
    String.fromCodePoint(
      ((byte1 & 0b00000111) << 18) |
        ((byte2 & 0b00111111) << 12) |
        ((byte3 & 0b00111111) << 6) |
        (byte4 & 0b00111111)
    ),
    3
  ];
};

const decodeThreeBytes = (byteArray, index) => {
  const byte1 = byteArray[index];

  if (byte1 > 0xdf && byte1 < 0xf0) {
    /* 1110xxxx 10xxxxxx 10xxxxxx */
    const byte2 = byteArray[index + 1];
    const byte3 = byteArray[index + 2];

    return [
      String.fromCharCode(
        ((byte1 & 0b00001111) << 12) |
          ((byte2 & 0b00111111) << 6) |
          (byte3 & 0b00111111)
      ),
      2
    ];
  }

  return decodeFourBytes(byteArray, index);
};

const decodeTwoBytes = (byteArray, index) => {
  const byte1 = byteArray[index];

  if (byte1 > 0b10111111 && byte1 < 0b11100000) {
    /* 110xxxxx 10xxxxxx */
    const byte2 = byteArray[index + 1];

    return [
      String.fromCharCode(((byte1 & 0b00011111) << 6) | (byte2 & 0b00111111)),
      1
    ];
  }

  return decodeThreeBytes(byteArray, index);
};

const decodeBytes = (byteArray, index) => {
  const byte1 = byteArray[index];

  if (byte1 < 0b10000000) {
    /* 0xxxxxxx*/
    return [String.fromCharCode(byte1), 0];
  }

  return decodeTwoBytes(byteArray, index);
};

const encode = text => {
  if (!isString(text)) {
    throw new TypeError("Type must be string for encoding in utf8.");
  }
  const byteArray = [];

  for (const chars of text) {
    const charCode = getCharCode(chars);

    encodeBytes(byteArray, charCode);
  }

  return new Uint8Array(byteArray);
};

const decode = byteArray => {
  if (!isByteArray(byteArray)) {
    throw new TypeError("Type must be Uint8Array for decoding in utf8.");
  }
  let decodedString = "";

  for (let index = 0; index < byteArray.length; index++) {
    const decodedBytes = decodeBytes(byteArray, index);

    decodedString += decodedBytes[0];
    index += decodedBytes[1];
  }
  return decodedString;
};

module.exports = {
  encode,
  decode
};
