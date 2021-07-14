import {
  validateSchema,
  tester,
  ValidationError,
  validate,
} from "../validator";

describe("middleware -- validator", () => {
  it("test function", () => {
    const email = "vova@example.com";
    expect(tester().isEmail().test(email)).toStrictEqual({
      isValid: true,
    });

    expect(tester().isEmpty().test(email)).toStrictEqual({
      isValid: false,
      message: undefined,
    });

    expect(tester().isEmpty().message("meow").test(email)).toStrictEqual({
      isValid: false,
      message: "meow",
    });

    expect(tester().required().message("oh no").test(undefined)).toStrictEqual({
      isValid: false,
      message: "oh no",
    });

    expect(tester().required().test(undefined)).toStrictEqual({
      isValid: false,
      message: "Value required",
    });
  });
  it("schema validation", () => {
    const obj = { name: "vova", age: "12" };

    expect(() =>
      validateSchema({ name: tester().isLength({ max: 3 }) }, obj)
    ).toThrow(ValidationError);

    expect(() =>
      validateSchema(
        { name: tester().isUppercase().message("test message") },
        obj
      )
    ).toThrow("test message");

    expect(() =>
      validateSchema({ name: tester().isLowercase() }, obj)
    ).not.toThrow();

    expect(() =>
      validateSchema(
        { name: tester().isLowercase(), password: tester().required() },
        obj
      )
    ).toThrow();
  });

  it("middleware", async (ok) => {
    const middleware = validate({
      query: {
        username: tester().isLength({ min: 3, max: 10 }),
        password: tester().required(),
      },
    });

    await expect(
      new Promise((res, rej) => {
        middleware({ query: { username: "hey" } }, {}, (err) => {
          if (err) rej(err);
          else res();
        });
      })
    ).rejects.toBeDefined();

    await expect(
      new Promise((res, rej) => {
        middleware(
          { query: { username: "dane4ka", password: "123" } },
          {},
          (err) => {
            if (err) rej(err);
            else res();
          }
        );
      })
    ).resolves.toBeUndefined();

    ok();
  });
});
