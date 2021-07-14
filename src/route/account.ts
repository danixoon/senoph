import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "@backend/db/models/user.model";
import { tester, validate } from "@backend/middleware/validator";
import { AppRouter } from ".";
import { ApiError, ErrorType } from "errors";

const router = AppRouter();

router.get(
  "/account/login",
  validate({
    query: {
      username: tester().required(),
      password: tester().required(),
    },
  }),
  async (req, res) => {
    const { password, username } = req.query;
    const accessError = new ApiError(
      ErrorType.ACCESS_DENIED,
      "Неверное имя пользователя или пароль."
    );

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

router.post(
  "/account",
  validate({
    query: {
      username: tester().required(),
      password: tester().required(),
    },
  }),
  async (req, res) => {
    const { username, password, role } = req.query;
    const hash = await bcrypt.hash(password, await bcrypt.genSalt(13));
    const user = await User.create({ passwordHash: hash, username, role });

    res.send();
  }
);

export default router;
