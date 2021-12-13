import * as React from "react";
import qs from "query-string";
import Layout from "components/Layout";

import PopupLayer from "providers/PopupLayer";

import "./style.styl";

import {
  Route,
  Switch,
  useHistory,
  useLocation,
  useRouteMatch,
} from "react-router";
import InfoBanner from "components/InfoBanner";
import CommitContent from "./Commit";
import ViewContent from "./View";
import CreateContent from "./Create";
import CommitPhoneContent from "./CommitPhone";
import ItemSelectionPopup from "layout/Popups/ItemSelectionPopup";
import { useAppDispatch } from "store";
import { extractStatus, parseItems } from "store/utils";
import { api } from "store/slices/api";
import Link from "components/Link";
import Button from "components/Button";
import Icon from "components/Icon";
import { NoticeContext } from "providers/NoticeProvider";
import UpdateContent from "./Update";
import Span from "components/Span";
import { InputBind, InputHook } from "hooks/useInput";
import { push } from "connected-react-router";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import { useNotice } from "hooks/useNotice";
import { usePaginator } from "hooks/usePaginator";
import { useQueryInput } from "hooks/useQueryInput";
import { clearObject } from "utils";
import { useHoldingWithHistory } from "./utils";


// const useContainer = (props: { holdings: Api.Models.Holding[] }) => {
//   const { holdings } = props;
//   const { path } = useRouteMatch();
//   const location = useLocation<{ act?: "select" }>();
//   const history = useHistory();
//   const query = qs.parse(location.search);

//   const isId = typeof query.selectedId === "string";

//   const ids = isId
//     ? holdings.find((holding) => holding.id.toString() === query.selectedId)
//         ?.phoneIds ?? []
//     : [];

//   const phones = parseItems(
//     api.useFetchPhonesQuery(
//       { ids, amount: ids.length, offset: 0 },
//       { skip: ids.length === 0 }
//     )
//   );

//   const [commit] = api.useCreateHoldingChangeMutation();

//   return {
//     path,
//     phones: {
//       ...phones,
//       data: ids.length === 0 ? { items: [], total: 0, offset: 0 } : phones.data,
//     },
//     holderId: isId ? parseInt(query.selectedId as string) : undefined,
//     isOpen: isId,
//     onToggle: (id?: number) => {
//       history.replace({
//         search: qs.stringify({ ...query, selectedId: id }),
//       });
//     },
//     act: location.state?.act,
//     onCommit: (action: "add" | "remove", holdingId: number, phoneId: number) =>
//       commit({ action, holdingId, phoneIds: [phoneId] }),
//     // onSelect: (id: string) =>
//     //   history.replace({
//     //     pathname: `/phone/view`,
//     //     search: qs.stringify({ selectedId: id }),
//     //   }),
//   };
// };

const useContainer = () => {
  const dispatch = useAppDispatch();

  const pageItems = 10;

  const filterHook = useQueryInput<{
    orderKey?: string;
    orderDate?: string;
    status?: any;
    holderId?: any;
    departmentId?: any;
  }>({});

  const [bindFilter, setFilter] = filterHook;
  // const [offset, setOffset] = React.useState(() => 0);

  // React.useEffect(() => {
  //   setOffset(0);
  // }, [
  //   bindFilter.input.orderDate,
  //   bindFilter.input.orderKey,
  //   bindFilter.input.departmentId,
  //   bindFilter.input.holderId,
  //   bindFilter.input.status,
  // ]);

  // TODO: Possible weak?
  const { id, ...filterData } = clearObject(bindFilter.input) as any;
  const holdings = useHoldingWithHistory({
    ...filterData,
    ids: id ? [id] : undefined,
  });

  const [createHolding, holdingCreationInfo] = api.useCreateHoldingMutation();

  const holdingCreationStatus = extractStatus(holdingCreationInfo);

  useNotice(holdingCreationStatus, {
    onSuccess: () => dispatch(push("/holding/commit")),
  });

  const { path } = useRouteMatch();

  // const { currentPage, maxPage } = usePaginator(
  //   offset,
  //   holdings.data.total ?? pageItems,
  //   pageItems
  // );

  return {
    createHolding,
    holdings,
    path,
    holdingCreationStatus,
    filterHook,
  };
};

const HoldingPage: React.FC = (props) => {
  const { path, holdings } = useContainer();

  // const {
  //   phones: holdingPhones,
  //   holderId,
  //   isOpen,
  //   onToggle,
  //   onCommit,
  //   act,
  //   path,
  // } = useContainer({ holdings: holdings.items });

  // const noticeContext = React.useContext(NoticeContext);

  return (
    <>
      <Layout flex="1" className="holding-page">
        <Switch>
          <Route path={`${path}/create`}>
            <CreateContent />
          </Route>
          <Route path={`${path}/commit`}>
            <CommitContent />
          </Route>
          <Route path={`${path}/view`}>
            <ViewContent />
          </Route>
          <Route path={`${path}/update`}>
            <UpdateContent />
          </Route>
          <Route path={`${path}/phone/commit`}>
            <CommitPhoneContent />
          </Route>
        </Switch>
      </Layout>
    </>
  );
};

export default HoldingPage;
