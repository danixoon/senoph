import { NoticeContext } from "providers/NoticeProvider";
import React from "react";

export const useNotice = (
  status: ApiStatus,
  config: {
    success?: string | null;
    error?: string | null;
    loading?: string | null;
    onError?: (error: Api.Error) => void;
    onSuccess?: () => void;
  } = {}
) => {
  const noticeContext = React.useContext(NoticeContext);
  React.useEffect(() => {
    if (status.isSuccess) {
      if (config.onSuccess) config.onSuccess();
      if (config.success !== null)
        noticeContext.createNotice(
          config.success ?? "Операция успешно выполнена"
        );
    }
    if (status.isError) {
      if (config.onError) config.onError(status.error as Api.Error);
      if (config.error !== null) {
        const message = status.error?.description ?? status.error?.message;
        noticeContext.createNotice(
          `Ошибка [${status.error?.name}]${message ? ` ${message}` : ""}${
            config.error ? ": " + config.error : ""
          }`
        );
      }
    }
    if (status.isLoading)
      if (config.loading !== null)
        noticeContext.createNotice(config.loading ?? "Операция выполняется..");
  }, [status.status]);
};
