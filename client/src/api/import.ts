import api from "api";
import axios, { AxiosResponse } from "axios";

export const importPhone = async (file: File) => {
  const data = new FormData();

  data.append("file", file);

  return api.request("post", "/import/file", {
    params: { target: "phone" as const },
    data: data as any,
    headers: {
      "Content-Type": `multipart/form-data`,
    },
  });
};

export const importBackup = async (file: File) => {
  const data = new FormData();

  data.append("file", file);

  return api.request("post", "/admin/backup/import", {
    params: {},
    data: data as any,
    headers: {
      "Content-Type": `multipart/form-data`,
    },
  });
};

export const exportBackup = async (id: string) => {
  const resp = await api.requestFull("get", "/admin/backup/export", {
    params: { id },
    responseType: "blob",
    data: {},
  });

  const url = window.URL.createObjectURL(new Blob([resp.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${id}.sbac`); //or any other extension
  document.body.appendChild(link);
  link.click();
};
