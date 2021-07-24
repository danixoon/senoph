import * as React from "react";
import {
  useUndoChangesMutation,
} from "store/slices/api";

export const useUndoChanges = <T extends ChangesTargetName>() => {
  const mutation = useUndoChangesMutation();
  return mutation;
};
