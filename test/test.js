const assert = require("assert");
const utf8 = require("../utils/encoding/utf8");

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
