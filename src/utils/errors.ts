type ErrorTypeMap = { [T in Api.ErrorType]: Omit<Api.Error, "name"> };

export const errorType = {
  ACCESS_DENIED: "ACCESS_DENIED",
  INVALID_QUERY: "INVALID_QUERY",
  INVALID_BODY: "INVALID_BODY",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVER_NOT_STARTED: "SERVER_NOT_STARTED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND", 
} as const;

export const errorMap: ErrorTypeMap = {
  [errorType.INTERNAL_ERROR]: {
    code: 500,
    message: "Внутренняя ошибка",
  },
  [errorType.ACCESS_DENIED]: {
    code: 403,
    message: "Доступ запрещён",
  },
  [errorType.INVALID_QUERY]: {
    code: 400,
    message: "Некорректные параметры запроса",
  },
  [errorType.INVALID_BODY]: {
    code: 400,
    message: "Некорректное тело запроса",
  },
  [errorType.NOT_FOUND]: {
    code: 404,
    message: "Не найдено",
  },
  [errorType.VALIDATION_ERROR]: {
    code: 400,
    message: "Ошибка валидации",
  },
  [errorType.SERVER_NOT_STARTED]: {
    code: 500,
    message: "Сервер не запущен",
  },
};

export class ApiError extends Error {
  payload: Api.Error & { name: Api.ErrorType };
  constructor(
    type: Api.ErrorType,
    info: { description?: string; payload?: any } = {}
  ) {
    const { description, payload } = info;
    const errorName = `${type}`;
    super(description ? `${errorName}: ${description}` : errorName);

    this.payload = { ...errorMap[type], name: type, description, payload };
  }
}
