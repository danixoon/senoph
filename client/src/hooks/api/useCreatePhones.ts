import * as React from "react";
import { useCreatePhonesMutation } from "store/slices/api";

export const useCreatePhones = () => {
  const hook = useCreatePhonesMutation();

  return hook;
};
