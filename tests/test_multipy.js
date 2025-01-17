// tests/test_multipy.js

const multiply = require("../util/multiply");
const get_chai = require("../util/get_chai");

describe("testing multiply", () => {
    it("should give 7*6 is 42", async () => {
        const { expect } = await get_chai();
        expect(multiply(7, 6)).to.equal(42);
    });
    it('should give 7*7 is 49', async () => {
        const {expect} = await get_chai();
        expect(multiply(7,7)).to.equal(49);
    });
});
