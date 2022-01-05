import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { store } from "store";

export const getToken = () => store.getState().app.token;
export const getHeaders = (overrideToken?: string) => {
  const token = overrideToken ?? getToken();
  if (token) return { Authorization: token };
};

export const request: <M extends Api.Methods, R extends Api.Routes<M>>(
  method: M,
  url: R,
  config: AxiosRequestConfig & {
    params: Api.GetQuery<M, R>;
    data: Api.GetBody<M, R>;
    token?: string;
  }
) => Promise<Api.GetResponse<M, R>> = async (method, url, config) => {
  try {
    const headers = { ...getHeaders(config.token), ...(config.headers ?? {}) };
    // console.log(headers);
    const response = await axios.request({
      ...{ ...config },
      url: "/api" + url,
      method: method as any,
      headers,
    });
    return response.data;
  } catch (err) {
    const e = err as AxiosError;
    throw e.response?.data;
  }
};

export const requestFull: <M extends Api.Methods, R extends Api.Routes<M>>(
  method: M,
  url: R,
  config: AxiosRequestConfig & {
    params: Api.GetQuery<M, R>;
    data: Api.GetBody<M, R>;
    token?: string;
  }
) => Promise<AxiosResponse<Api.GetResponse<M, R>>> = async (
  method,
  url,
  config
) => {
  try {
    const headers = { ...getHeaders(config.token), ...(config.headers ?? {}) };
    // console.log(headers);
    const response = await axios.request({
      ...{ ...config },
      url: "/api" + url,
      method: method as any,
      headers,
    });
    return response;
  } catch (err) {
    const e = err as AxiosError;
    throw e;
  }
};

// class Er extends Error {
//   payload: any;
//   constructor(e: any) {
//     super();
//     this.payload = e;
//   }
// }

export default { request, requestFull };

// export const api: {
//   get: typeof axios.get;
//   post: typeof axios.post;
//   put: typeof axios.put;
// } = {
//   get: async (url, config) => {
//     try {
//       return (
//         await axios.get("/api" + url, { ...config, headers: getHeaders() })
//       ).data;
//     } catch (error) {
//       throw error.response?.data.error ?? error;
//     }
//   },
//   post: async (url, body, config) => {
//     try {
//       return (
//         await axios.post("/api" + url, body, {
//           ...config,
//           headers: getHeaders(),
//         })
//       ).data;
//     } catch (error) {
//       throw error.response?.data.error ?? error;
//     }
//   },
//   put: async (url, body, config) => {
//     try {
//       return (
//         await axios.put("/api" + url, body, {
//           ...config,
//           headers: getHeaders(),
//         })
//       ).data;
//     } catch (error) {
//       throw error.response?.data.error ?? error;
//     }
//   },
// };
