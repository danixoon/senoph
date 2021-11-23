import * as React from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";
import { groupBy } from "utils";

export type ChangeStatus = {
  targetId: number;
  keys: string[];
  status: ApiStatus;
};
export const useChanges = <T extends ChangesTargetName>(target: T) => {
  const { data } = api.useFetchChangesQuery({ target });

  const [makeChanges, makeInfo] = api.useMakeChangesMutation();
  const [undoChanges, undoInfo] = api.useUndoChangesMutation();

  const makeStatus = extractStatus(makeInfo, true);
  const undoStatus = extractStatus(undoInfo, true);

  const mergeStatuses = (a: ApiStatus, b: ApiStatus) => {
    const status: ApiStatus = {
      error: a.error || b.error,
      isError: a.isError || b.isError,
      isIdle: a.isIdle && b.isIdle,
      isLoading: a.isLoading || b.isLoading,
      isSuccess: a.isSuccess && b.isSuccess,
      status:
        a.status === b.status
          ? b.status
          : a.status === "error" || b.status === "error"
          ? "error"
          : a.status === "loading" || b.status === "loading"
          ? "loading"
          : a.status === "success" && b.status === "success"
          ? "success"
          : "idle",
    };

    return status;
  };

  const statuses: Map<number, ChangeStatus> = new Map();
  if (makeInfo.originalArgs) {
    const { targetId, changes } = makeInfo.originalArgs;
    const keys = Object.keys(changes);
    statuses.set(targetId, { targetId, keys, status: makeStatus });
  }
  if (undoInfo.originalArgs) {
    const { targetId, keys = [] } = undoInfo.originalArgs;
    let existing = statuses.get(targetId);
    if (!existing) {
      statuses.set(targetId, { targetId, keys, status: undoStatus });
    } else {
      existing.keys = [...existing.keys, ...keys];
      existing.status = mergeStatuses(makeStatus, undoStatus);
    }
  }

  // console.log(makeInfo.originalArgs);

  return [
    data?.items ?? [],
    (targetId: number, changes: any) =>
      makeChanges({ target, targetId, changes }),
    (targetId: number, keys: string[]) =>
      undoChanges({ target, targetId, keys }),
    statuses,
  ] as const;
};
