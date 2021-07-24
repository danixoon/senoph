import * as React from "react";
import { useMakeChangesMutation } from "store/slices/api";

export const useMakeChanges = <T extends ChangesTargetName>() => {
  const hook = useMakeChangesMutation();
  return hook;
};
