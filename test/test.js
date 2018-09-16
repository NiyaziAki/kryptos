const assert = require("assert");
const utf8 = require("../utils/encoding/utf8");
const kryptos = require("../kryptos");

describe("Utils", () => {
  describe("Encoding", () => {
    describe("UTF 8", () => {
      it("should encode and decode successfully.", done => {
        const string = "aşࠀ💩";
        const byteArray = utf8.encode(string);
        const decodedByteArray = utf8.decode(byteArray);

        assert(string === decodedByteArray);

        const { StringDecoder } = require("string_decoder");
        const decoder = new StringDecoder("utf8");
        const nodeDecodedByteArray = decoder.write(Buffer.from(byteArray));

        assert(string === nodeDecodedByteArray);

        done();
      });
    });
  });
});

describe("Hash", () => {
  describe("Sha 256", () => {
    it("should hash value successfully.", done => {
      const sha256 = kryptos.hash.sha256;

      let hash = sha256.hash("abc");
      assert(
        hash ===
          "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
      );
      done();
    });
  });
});
