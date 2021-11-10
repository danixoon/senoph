import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "@backend/db/models/user.model";
import { tester, validate } from "@backend/middleware/validator";
import { AppRouter } from "../router";
import { ApiError, errorType } from "@backend/utils/errors";
import { access } from "@backend/middleware/auth";
import { handler, prepareItems } from "../utils";
import Log from "@backend/db/models/log.model";

const router = AppRouter();

router.get(
  "/account",
  access("user"),
  handler(async (req, res, next) => {
    const { id } = req.params.user;
    const user = await User.findByPk(id, { attributes: ["role", "username"] });

    if (!user)
      return next(
        new ApiError(errorType.NOT_FOUND, {
          description: "Пользователь не найден",
        })
      );

    res.send({ id, role: user.role, username: user.username, name: user.name });
  })
);

router.delete(
  "/account",
  access("admin"),
  validate({ query: { id: tester().required().isNumber() } }),
  handler(async (req, res) => {
    const { id: userId } = req.params.user;
    const { id } = req.query;

    if (userId === id)
      throw new ApiError(errorType.INVALID_QUERY, {
        description: "Невозможно удалить самого себя.",
        payload: { userId, targetId: id },
      });

    const destroyed = await User.destroy({ where: { id } });

    Log.log("user", [id], "delete", userId);

    res.send();
  })
);

router.get(
  "/accounts",
  access("admin"),
  validate({
    query: {},
  }),
  handler(async (req, res, next) => {
    const {} = req.query;
    // const filter = new Filter(req.query);

    // const search = [firstName, lastName, middleName].filter((v) => v).join(" ");

    // filter
    //   .or((f) =>
    //     f
    //       .addWith("firstName", name, Op.substring)
    //       .addWith("lastName", name, Op.substring)
    //       .addWith("middleName", name, Op.substring)
    //   )
    //   .add("departmentId")
    //   .add("id");

    const users = await User.findAll({
      // where: filter.where,
    });

    // console.log(filter.where);

    res.send(prepareItems(users as Api.Models.User[], users.length, 0));
  })
);

router.get(
  "/account/login",
  // access("unknown", true),
  validate({
    query: {
      username: tester().required(),
      password: tester().required(),
    },
  }),
  handler(async (req, res, next) => {
    const { password, username } = req.query;
    const accessError = new ApiError(errorType.ACCESS_DENIED, {
      description: "Неверное имя пользователя или пароль.",
    });

    const user = await User.unscoped().findOne({ where: { username } });
    if (!user) return next(accessError);

    const isCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isCorrect) return next(accessError);

    const token = jwt.sign(
      { role: user.role, id: user.id },
      process.env.SECRET
    );
    res.send({ token, id: user.id, role: user.role });
  })
);

// TODO: Передвинуть енто в модель пользователя
const ALLOWED_ROLES = ["user", "admin"];

router.post(
  "/account",
  access("admin"),
  validate({
    query: {
      name: tester().required(),
      username: tester().required(),
      password: tester().required(),
      role: tester()
        .required()
        .isIn(ALLOWED_ROLES)
        .message(`Разрешённые роли: ${ALLOWED_ROLES.join()}`),
    },
  }),
  handler(async (req, res) => {
    const { id: userId } = req.params.user;
    const { name, username, password, role } = req.query;
    const hash = await bcrypt.hash(password, await bcrypt.genSalt(13));
    const user = (await User.create({
      name,
      passwordHash: hash,
      username,
      role,
    })) as Api.Models.User;

    Log.log("user", [user.id], "delete", userId);

    res.send(user);
  })
);

export default router;
