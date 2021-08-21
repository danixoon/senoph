import * as React from "react";
import { api } from "store/slices/api";

export const useChanges = <T extends ChangesTargetName>(target: T) => {
  const { data } = api.useFetchChangesQuery({ target });

  const [makeChanges] = api.useMakeChangesMutation();
  const [undoChanges] = api.useUndoChangesMutation();

  return [
    data?.items ?? [],
    (targetId: number, changes: any) =>
      makeChanges({ target, targetId, changes }),
    (targetId: number, keys: string[]) =>
      undoChanges({ target, targetId, keys }),
  ] as const;
};
