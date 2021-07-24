import * as React from "react";
import {
  useFetchFilterConfigQuery,
  useFetchPhoneQuery,
  useFetchPhonesQuery,
  useFetchChangesQuery,
  useUndoChangesMutation,
  useMakeChangesMutation,
} from "store/slices/api";

export const useChanges = <T extends ChangesTargetName>(target: T) => {
  const { data } = useFetchChangesQuery({ target });

  const [makeChanges] = useMakeChangesMutation();
  const [undoChanges] = useUndoChangesMutation();

  return [
    data ?? {},
    (targetId: number, changes: any) =>
      makeChanges({ target, targetId, changes }),
    (targetId: number, keys: string[]) =>
      undoChanges({ target, targetId, keys }),
  ] as const;
};
