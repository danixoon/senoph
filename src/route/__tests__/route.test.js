import axios from "axios";
import { init, close } from "../../index";

const port = process.env.PORT || 5000;
const host = `http://localhost:${port}/api`;

// jest.useFakeTimers();

const authHeader = { Authorization: process.env.API_TEST_TOKEN };

const expectError = (promise, code, name) =>
  new Promise(async (res, rej) => {
    const resp = await promise.catch((err) => {
      const { response } = err;
      expect(response.status).toBe(code);

      const { error } = response.data;
      expect(error.name).toBe(name);
      res();
    });
    expect(resp).toBeUndefined();
    rej();
  });

describe("route testing", () => {
  beforeAll(async () => {
    await init();
  });

  it("account create without token", async (ok) => {
    await expectError(axios.post(`${host}/account`), 403, "ACCESS_DENIED");
    ok();
  });

  it("account create without query", async (ok) => {
    await expectError(
      axios.post(`${host}/account`, {}, { headers: authHeader }),
      400,
      "INVALID_QUERY"
    );
    ok();
  });

  it("account create", async (ok) => {
    const { data } = await axios.post(
      `${host}/account`,
      {},
      {
        headers: authHeader,
        params: { username: "test", password: "test", role: "user" },
      }
    );

    expect(data.id).toBeDefined();
    expect(data.username).toBe("test");
    expect(data.role).toBe("user");

    ok();
  });

  it("phone strict put", async (ok) => {
    await expectError(
      axios.put(
        `${host}/phone`,
        { assemblyDate: true, meow: false },
        { headers: authHeader, params: { id: 0 } }
      ),
      400,
      "INVALID_BODY"
    );
    ok();
  });

  afterAll(async () => {
    // await close();
  });
});
