import axios, { AxiosRequestConfig } from "axios";

export const getToken = () => window.localStorage.getItem("token");
export const getHeaders = () => {
  const token = getToken();
  if (token) return { Authorization: token };
};

export const request: (
  urL: string,
  method: NonNullable<AxiosRequestConfig["method"]>,
  config?: AxiosRequestConfig
) => ReturnType<typeof axios.request> = async (url, method, config = {}) => {
  const response = await axios.request({
    ...config,
    url: "/api" + url,
    method,
    headers: getHeaders(),
  });
  return response.data.data;
};

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
