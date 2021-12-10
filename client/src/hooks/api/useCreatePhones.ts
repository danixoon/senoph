import * as React from "react";
import { api } from "store/slices/api";

export const useCreatePhones = () => {
  const hook = api.useCreatePhonesMutation();

  return hook;
};
