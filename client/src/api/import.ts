import api from "api";
import axios, { AxiosResponse } from "axios";

export const importPhone = async (file: File) => {
  const data = new FormData();

  data.append("file", file);

  return api.request("post", "/import", {
    params: { target: "phone" as const },
    data: data as any,
    headers: {
      "Content-Type": `multipart/form-data`,
    },
  });
};
