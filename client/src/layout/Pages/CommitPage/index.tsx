import React from "react";

import Header from "components/Header";
import Layout from "components/Layout";
import Table, { TableColumn } from "components/Table";
import Hr from "components/Hr";
import { Route, Switch, useRouteMatch } from "react-router";
import { api } from "store/slices/api";
import { extractStatus, parseItems, parseQuery } from "store/utils";
import ActionBox from "components/ActionBox";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import { useInput } from "hooks/useInput";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import { clearObject, getLocalDate } from "utils";
import { getDefaultColumns as getPhonePageColumns } from "../PhonePage/Items";
import Checkbox from "components/Checkbox";
import TopBarLayer from "providers/TopBarLayer";
import ButtonGroup from "components/ButtonGroup";
import Button from "components/Button";
import Badge from "components/Badge";
import Icon, { LoaderIcon } from "components/Icon";
import { useNotice } from "hooks/useNotice";
import Span from "components/Span";
import Paginator from "components/Paginator";
import { usePaginator } from "hooks/usePaginator";
import { useQueryInput } from "hooks/useQueryInput";
import Actions from "./Actions";
import Updates from "./Updates";

// const useChangesContainer = (query: {} = {}) => {
//   // const { status } = query;
//   const changes = api.useFetchChangesQuery({ target: "phone" });
//   const [approveChanges, approveChangesInfo] =
//     api.useCommitChangesApproveMutation();
//   const [declineChanges, declineChangesInfo] =
//     api.useCommitChangesDeclineMutation();
//   return {
//     changes: parseItems(changes),
//     approve: approveChanges,
//     decline: declineChanges,
//     declineStatus: extractStatus(declineChangesInfo),
//     approveStatus: extractStatus(approveChangesInfo),
//   };
// };

// const ChangeCommits: React.FC<{}> = (props) => {
//   type ItemType = ArrayElement<typeof changes.data.items>;

//   const [selectedIds, setSelection] = React.useState<number[]>(() => []);

//   const { approve, decline, approveStatus, declineStatus, changes } =
//     useChangesContainer();

//   React.useEffect(() => {
//     const updatedSelection: number[] = [];
//     for (const commit of changes.data.items)
//       if (selectedIds.includes(commit.id)) updatedSelection.push(commit.id);

//     setSelection(updatedSelection);
//   }, [changes.data.items]);

//   const columns: TableColumn<ItemType>[] = [
//     {
//       key: "actions",
//       header: "",
//       size: "30px",
//       mapper: (v, item) => (
//         <ActionBox status={approveStatus}>
//           <SpoilerPopupButton
//             onClick={() => approve({ targetId: item.id, target: "phone" })}
//           >
//             Подтвердить
//           </SpoilerPopupButton>
//           <SpoilerPopupButton
//             onClick={() =>
//               decline({ targetId: item.id, target: "phone", keys: [""] })
//             }
//           >
//             Отменить
//           </SpoilerPopupButton>
//         </ActionBox>
//       ),
//     },
//     ...getPhonePageColumns(),
//     {
//       key: "statusAt",
//       header: "Добавлено",
//       size: "100px",
//       mapper: (v, item) => {
//         const date = item.createdAt ? new Date(item.createdAt) : null;
//         if (!date) return "Не определено";

//         const isCurrentDay = () => {
//           const current = new Date();
//           const [day, month, year] = [
//             current.getDay(),
//             current.getMonth(),
//             current.getFullYear(),
//           ];
//           const [_day, _month, _year] = [
//             date.getDay(),
//             date.getMonth(),
//             date.getFullYear(),
//           ];

//           return _day === day && _month === month && _year === year;
//         };

//         return isCurrentDay()
//           ? date.toTimeString().split(/\s+/)[0]
//           : date.toDateString();
//       },
//     },
//     {
//       key: "status",
//       header: "Статус",
//       mapper: (v, item) =>
//         item.status === "create-pending" ? (
//           <Span weight="bold">Создание</Span>
//         ) : item.status === "delete-pending" ? (
//           <Span weight="bold" color="primary">
//             Удаление
//           </Span>
//         ) : (
//           item.status
//         ),
//     },

//     {
//       header: (
//         <Checkbox
//           name="selectedAll"
//           input={{
//             selectedAll: selectedIds.length === changes.data.items.length,
//           }}
//           onChange={(e) => {
//             setSelection(
//               selectedIds.length === changes.data.items.length
//                 ? []
//                 : changes.data.items.map((item) => item.id)
//             );
//           }}
//         />
//       ),
//       props: { style: { textAlign: "center" } },
//       mapper: (v, item) => {
//         const isSelected = selectedIds.includes(item.id);

//         if (isSelected && approveStatus.isLoading) return <LoaderIcon />;

//         return (
//           <Checkbox
//             containerProps={{ style: { margin: 0 } }}
//             name="isSelected"
//             input={{
//               isSelected,
//             }}
//             onChange={(e) =>
//               e.target.checked
//                 ? setSelection([...selectedIds, item.id])
//                 : setSelection(selectedIds.filter((v) => v !== item.id))
//             }
//           />
//         );
//       },
//       key: "selectedIds",
//       size: "30px",
//     },
//   ];

//   useNotice(approveStatus, {
//     // success: "",
//   });

//   return (
//     <>
//       <CommitContent
//         onCommit={(ids, action) => {}}
//         items={changes.data.items}
//         columns={columns}
//       >
//         <Layout>
//           <Header unsized bottom align="right">
//             Фильтр
//           </Header>
//         </Layout>
//       </CommitContent>
//     </>
//   );
// };

const CommitPage: React.FC<{}> = (props) => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/actions`}>
        <Actions />
      </Route>
      <Route path={`${path}/updates`}>
        <Updates />
      </Route>
    </Switch>
  );
};

export default CommitPage;
