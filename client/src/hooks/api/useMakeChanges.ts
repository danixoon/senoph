import * as React from "react";
import { api } from "store/slices/api";

export const useMakeChanges = <T extends ChangesTargetName>() => {
  const hook = api.useMakeChangesMutation();
  return hook;
};
