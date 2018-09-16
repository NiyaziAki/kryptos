const utf8 = require("./utils/encoding/utf8");
const sha256 = require("./hash/sha256");

module.exports = {
  encoding: {
    utf8: Object.freeze(utf8)
  },
  hash: {
    sha256: Object.freeze(sha256)
  }
};
