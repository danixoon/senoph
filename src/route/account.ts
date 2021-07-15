import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "@backend/db/models/user.model";
import { tester, validate } from "@backend/middleware/validator";
import { AppRouter } from ".";
import { ApiError, ErrorType } from "@backend/route/errors";
import { access } from "@backend/middleware/auth";

const router = AppRouter();

router.get(
  "/account/login",
  access("unknown", true),
  validate({
    query: {
      username: tester().required(),
      password: tester().required(),
    },
  }),
  async (req, res) => {
    const { password, username } = req.query;
    const accessError = new ApiError(ErrorType.ACCESS_DENIED, {
      description: "Неверное имя пользователя или пароль.",
    });

    const user = await User.findOne({ where: { username } });
    if (!user) throw accessError;

    const isCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isCorrect) throw accessError;

    const token = jwt.sign(
      { role: user.role, id: user.id },
      process.env.SECRET
    );
    res.send({ token, id: user.id, role: user.role });
  }
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
  async (req, res) => {
    const { username, password, role } = req.query;
    const hash = await bcrypt.hash(password, await bcrypt.genSalt(13));
    const user = await User.create({ passwordHash: hash, username, role });

    res.send(user);
  }
);

export default router;
