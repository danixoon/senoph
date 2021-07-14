import axios from "axios";
import { init, close } from "../../index";

const port = process.env.PORT || 5000;

axios.defaults = { baseURL: `http://localhost:${port}/api` };

describe("route testing", () => {
  beforeAll(async () => {
    await init();
  });
  describe("account", () => {
    it("create", async (ok) => {
      const resp = await axios.post("/api/account");
      expect(resp.data.error).toBeDefined();
      ok();
    });
  });
  afterAll(async () => {
    await close();
  });
});
