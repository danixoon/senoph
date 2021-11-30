import { NoticeContext } from "providers/NoticeProvider";
import React from "react";

export const useNotice = (
  status: ApiStatus,
  config: {
    success?: string;
    error?: string;
    loading?: string;
    onError?: (error: Api.Error) => void;
    onSuccess?: () => void;
  } = {}
) => {
  const noticeContext = React.useContext(NoticeContext);
  React.useEffect(() => {
    if (status.isSuccess) {
      if (config.onSuccess) config.onSuccess();
      noticeContext.createNotice(
        config.success ?? "Операция успешно выполнена"
      );
    }
    if (status.isError) {
      if (config.onError) config.onError(status.error as Api.Error);
      const message = status.error?.description ?? status.error?.message;
      noticeContext.createNotice(
        `Ошибка [${status.error?.name}]${message ? ` ${message}` : ""}: ${
          config.error
        }`
      );
    }
    if (status.isLoading)
      noticeContext.createNotice(config.loading ?? "Операция выполняется..");
  }, [status.status]);
};
