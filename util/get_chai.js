// util/get_chai.js

let chai_obj = null;

const get_chai = async () => {
    if (!chai_obj) {
        const { expect, use } = await import("chai");
        const chaiHttp = await import("chai-http");
        const chai = use(chaiHttp.default);
        chai_obj = { expect: expect, request: chai.request };
    }
    return chai_obj;
};

module.exports = get_chai;
