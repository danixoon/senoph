import { useChanges } from "hooks/api/useChanges";
// import { useFetchPhone } from "hooks/api/useFetchPhone";
import { useFetchPhoneCommits } from "hooks/api/useFetchPhoneCommits";
import PhoneCommitPage, {
  PhoneCommitPageTab,
} from "layout/Pages/PhoneCommitPage";
import React from "react";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";
import { useAppDispatch, useAppSelector } from "store";
import { api } from "store/slices/api";
import { login } from "store/slices/app";
import { splitStatus } from "store/utils";

type Props = {};

const CommitPageContainer: React.FC<Props> = (props) => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/create`}>
        <PhoneCommitPageContainer tab="create" />
      </Route>
      <Route path={`${path}/edit`}>
        <PhoneCommitPageContainer tab="edit" />
      </Route>
      <Route path={`${path}/delete`}>
        <PhoneCommitPageContainer tab="delete" />
      </Route>
    </Switch>
  );
};


const PhoneCommitPageContainer: React.FC<{ tab: PhoneCommitPageTab }> = (
  props
) => {
  const { tab } = props;
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
    <PhoneCommitPage
      tab={tab}
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
