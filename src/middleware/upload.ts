import path from "path";
import { v4 as uuid } from "uuid";
import multer from "multer";
import { ApiError, errorType } from "@backend/utils/errors";

type MapUpload<P, RB = any, Q = any, B = any, T = ReturnType<typeof multer>> = {
  [K in keyof T]: T[K] extends (...args: infer A) => any
    ? (...args: A) => Api.Request<P, RB, Q, B>
    : never;
};

const memoryStorage = multer.memoryStorage();

export const discStorage = multer.diskStorage({
  destination: path.resolve(__dirname, "../../uploads/"),
  filename: (req, file, cb) => {
    const { user } = req.params as any;
    const filename = `${user ? `${user.id}_` : ""}${uuid()}${path.extname(
      file.originalname
    )}`;
    cb(null, filename);
  },
});

export const upload = (...ext: string[]) =>
  multer({
    storage: discStorage,

    fileFilter: (req, file, cb) => {
      if (!ext.find((e) => file.originalname.endsWith(e)))
        cb(
          new ApiError(errorType.INVALID_BODY, {
            description: `Расширение загружаемого файла должно быть одним из ${ext.join()}`,
          })
        );
      else cb(null, true);
    },
  }) as MapUpload<any, any, any, any>;

export const uploadMemory = (...ext: string[]) =>
  multer({
    storage: memoryStorage,
    fileFilter: (req, file, cb) => {
      if (!ext.find((e) => file.originalname.endsWith(e)))
        cb(
          new ApiError(errorType.INVALID_BODY, {
            description: `Расширение загружаемого файла должно быть одним из ${ext.join()}`,
          })
        );
      else cb(null, true);
    },
  }) as MapUpload<any, any, any, any>;

// export const upload;
