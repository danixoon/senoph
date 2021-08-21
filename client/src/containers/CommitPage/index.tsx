import { useChanges } from "hooks/api/useChanges";
// import { useFetchPhone } from "hooks/api/useFetchPhone";
import { useFetchPhoneCommits } from "hooks/api/useFetchPhoneCommits";
import CommitPage from "layout/Pages/CommitPage";
import React from "react";
import { useLocation } from "react-router";
import { useAppDispatch, useAppSelector } from "store";
import { api } from "store/slices/api";
import { login } from "store/slices/app";
import { splitStatus } from "store/utils";

type Props = {};
const CommitPageContainer: React.FC<Props> = (props) => {
  const { pathname } = useLocation();

  const tab = pathname.split("/").pop();

  const { data } = useFetchPhoneCommits();

  const fetchedCommits = data ?? { items: [], total: 0, offset: 0 };

  const deletedCommits: Api.Models.Phone[] = [];
  const createdCommits: Api.Models.Phone[] = [];

  for (const commit of fetchedCommits.items)
    if (commit.status === "delete-pending") deletedCommits.push(commit);
    else createdCommits.push(commit);

  const [commit, info] = api.useCommitPhoneMutation();
  const [changeCommits] = useChanges("phone");
  const { data: originals, isSuccess } = api.useFetchPhonesQuery(
    {
      ids: changeCommits.map((c) => c.id),
      offset: 0,
      amount: changeCommits.length,
    },
    { skip: changeCommits.length === 0 }
  );

  const changes = isSuccess
    ? changeCommits.map((changes) => ({
        original: originals?.items.find((o) => o.id === changes.id),
        changes,
      }))
    : [];

  const [approveCommitChanges] = api.useCommitChangesApproveMutation();
  const [declineCommitChanges] = api.useCommitChangesDeclineMutation();

  return (
    <CommitPage
      tab={tab as any}
      commits={{
        created: createdCommits,
        deleted: deletedCommits,
        changes: changes as any,
      }}
      onCommit={(ids, action) => commit({ ids, action })}
      onCommitChanges={(target, targetId, action) =>
        action === "approve"
          ? approveCommitChanges({ target: target as any, targetId })
          : declineCommitChanges({ target: target as any, targetId })
      }
    />
  );
};

export default CommitPageContainer;
