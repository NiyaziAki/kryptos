const hashConstants = require("../utils/constants/hash-constants");
const isString = require("../utils/validation/is-string");
const utf8 = require("../utils/encoding/utf8");

const rotateRight = (value, numberToShift) =>
  ((value >>> numberToShift) | (value << (32 - numberToShift))) >>> 0;

const choose = (x, y, z) => (x & y) ^ (~x & z);

const majority = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);

const sigma0256 = x =>
  rotateRight(x, 2) ^ rotateRight(x, 13) ^ rotateRight(x, 22);

const sigma1256 = x =>
  rotateRight(x, 6) ^ rotateRight(x, 11) ^ rotateRight(x, 25);

const gamma0256 = x => rotateRight(x, 7) ^ rotateRight(x, 18) ^ (x >>> 3);

const gamma1256 = x => rotateRight(x, 17) ^ rotateRight(x, 19) ^ (x >>> 10);

const zeroPad = number => {
  const value = number.toString(2);

  return "00000000".slice(value.length) + value;
};

const hash = value => {
  if (!isString(value)) {
    throw new Error();
  }

  const byteArray = utf8.encode(value);
  const messageLength = byteArray.length * 8;

  let message = byteArray.reduce((accumulator, currentValue) => {
    let text = accumulator;

    return (text += zeroPad(currentValue));
  }, "");

  message += "1";

  const modulus = (messageLength + 1) % 512;

  const leadingZeros = modulus > 448 ? 960 - modulus : 448 - modulus;

  message += "0".repeat(leadingZeros);

  const length = messageLength.toString(2);
  const bitBlock = message + "0".repeat(64 - length.length) + length;

  const blocks = [];

  for (let index = 0; index < bitBlock.length / 32; index++) {
    blocks.push(parseInt(bitBlock.slice(index * 32, (index + 1) * 32), 2));
  }

  const initialHashValues = [hashConstants.sha256InitialHashValues];

  for (let i = 0; i < blocks.length; i += 16) {
    const messageSchedule = [];

    for (let t = 0; t < 64; t++) {
      if (t < 16) {
        messageSchedule[t] = blocks[t + i] >>> 0;
      } else {
        messageSchedule[t] =
          (gamma1256(messageSchedule[t - 2]) +
            messageSchedule[t - 7] +
            gamma0256(messageSchedule[t - 15]) +
            messageSchedule[t - 16]) >>>
          0;
      }
    }

    let a = initialHashValues[i][0];
    let b = initialHashValues[i][1];
    let c = initialHashValues[i][2];
    let d = initialHashValues[i][3];
    let e = initialHashValues[i][4];
    let f = initialHashValues[i][5];
    let g = initialHashValues[i][6];
    let h = initialHashValues[i][7];
    let temp1, temp2;

    for (let t = 0; t < 64; t++) {
      temp1 =
        h +
        sigma1256(e) +
        choose(e, f, g) +
        hashConstants.sha256Constants[t] +
        messageSchedule[t];
      temp2 = sigma0256(a) + majority(a, b, c);

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    initialHashValues[i + 1] = [];
    initialHashValues[i + 1][0] = (a + initialHashValues[i][0]) >>> 0;
    initialHashValues[i + 1][1] = (b + initialHashValues[i][1]) >>> 0;
    initialHashValues[i + 1][2] = (c + initialHashValues[i][2]) >>> 0;
    initialHashValues[i + 1][3] = (d + initialHashValues[i][3]) >>> 0;
    initialHashValues[i + 1][4] = (e + initialHashValues[i][4]) >>> 0;
    initialHashValues[i + 1][5] = (f + initialHashValues[i][5]) >>> 0;
    initialHashValues[i + 1][6] = (g + initialHashValues[i][6]) >>> 0;
    initialHashValues[i + 1][7] = (h + initialHashValues[i][7]) >>> 0;
  }

  const finalHashValues = initialHashValues[blocks.length / 16];
  const hashArray = finalHashValues.map(x => zeroPad((x >>> 0).toString(16)));

  return hashArray.join("");
};

module.exports = {
  hash
};
