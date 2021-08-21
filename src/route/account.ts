import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "@backend/db/models/user.model";
import { tester, validate } from "@backend/middleware/validator";
import { AppRouter } from "../router";
import { ApiError, errorType } from "@backend/utils/errors";
import { access } from "@backend/middleware/auth";
import { handler } from "../utils";

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

    res.send({ id, role: user.role, username: user.username });
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

    const user = await User.findOne({ where: { username } });
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
      username: tester().required(),
      password: tester().required(),
      role: tester()
        .required()
        .isIn(ALLOWED_ROLES)
        .message(`Разрешённые роли: ${ALLOWED_ROLES.join()}`),
    },
  }),
  handler(async (req, res) => {
    const { username, password, role } = req.query;
    const hash = await bcrypt.hash(password, await bcrypt.genSalt(13));
    const user = (await User.create({
      passwordHash: hash,
      username,
      role,
    })) as Api.Models.User;

    res.send(user);
  })
);

export default router;
