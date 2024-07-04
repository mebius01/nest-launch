import { E2EInit } from "../../src/services/test/test.service";

const e2eInitTest = new E2EInit();


describe('Users (e2e)', () => {
  beforeAll(async () => await e2eInitTest.before());
  afterAll(async () => await e2eInitTest.after());

  it('Create', async () => {

  });

});
