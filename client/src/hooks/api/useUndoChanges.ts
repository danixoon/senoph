import * as React from "react";
import { api } from "store/slices/api";

export const useUndoChanges = <T extends ChangesTargetName>() => {
  const mutation = api.useUndoChangesMutation();
  return mutation;
};
