import * as React from "react";
import { api } from "store/slices/api";

// export const useFetchPhone = (id: number | null) => {
//   const { data, isFetching, isError } = api.useFetchPhoneQuery(
//     { id: id as number },
//     { skip: id == null }
//   );
//   return { phone: isFetching || isError ? null : data ?? null };
// };
