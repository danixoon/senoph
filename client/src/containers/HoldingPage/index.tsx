import Paginator from "components/Paginator";
import { push } from "connected-react-router";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import { useNotice } from "hooks/useNotice";
import { usePaginator } from "hooks/usePaginator";
import { useQueryInput } from "hooks/useQueryInput";
import HoldingPage from "layout/Pages/HoldingPage";
import { NoticeContext } from "providers/NoticeProvider";
import TopBarLayer from "providers/TopBarLayer";
import React from "react";
import { QueryStatus } from "react-query";
import { getStatusProps } from "react-query/types/core/utils";
import { useAppDispatch, useAppSelector } from "store";
import { api } from "store/slices/api";
import { extractStatus, isApiError } from "store/utils";
import { clearObject } from "utils";

type Props = {};
const HoldingPageContainer: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();

  const { departments } = useFetchConfigMap();

  // const [bind] = useQueryInput<
  //   Partial<
  //     Record<
  //       | "holderId"
  //       | "departmentId"
  //       | "orderDate"
  //       | "orderKey"
  //       | "status"
  //       | "phoneIds",
  //       string
  //     >
  //   >
  // >({});

  // const phoneIds =
  //   bind.input.phoneIds?.split(",").map((id) => Number(id)) ?? [];

  const pageItems = 10;

  const filterHook = useQueryInput<{
    orderKey?: string;
    orderDate?: string;
    status?: any;
    holderId?: any;
    departmentId?: any;
  }>({});

  const [bindFilter, setFilter] = filterHook;
  const [offset, setOffset] = React.useState(() => 0);

  React.useEffect(() => {
    setOffset(0);
  }, [
    bindFilter.input.orderDate,
    bindFilter.input.orderKey,
    bindFilter.input.departmentId,
    bindFilter.input.holderId,
    bindFilter.input.status,
  ]);

  // TODO: Possible weak?
  const { id, ...filterData } = clearObject(bindFilter.input) as any;
  const { data: holdings, ...holdingsRest } = api.useFetchHoldingsQuery({
    ...filterData,
    ids: id ? [id] : undefined,
    offset,
    amount: pageItems,
  });

  const holdingPhoneIds = Array.from(
    // TODO: Flat map..?
    (holdings?.items ?? [])
      .reduce(
        (set, v) => v.phoneIds.reduce((set, id) => set.add(id), set),
        new Set<number>()
      )
      .values()
  ).sort((a, b) => (a > b ? 1 : -1));

  const { data: phoneHoldings, ...phoneHoldingsRest } =
    api.useFetchPhoneHoldingsQuery(
      {
        phoneIds: holdingPhoneIds,
        // ...filterData,
      },
      { skip: holdingPhoneIds.length === 0 }
    );

  const holdingMap = new Map<number, Api.Models.Holding[]>();
  for (const holding of phoneHoldings?.items ?? []) {
    for (const phoneId of holding.phoneIds) {
      const holdingList = holdingMap.get(phoneId) ?? [];

      holdingMap.set(phoneId, [...holdingList, holding]);
    }
  }

  // const phonesStatus = extractStatus(phonesRest, true);
  const holdingsStatus = extractStatus(holdingsRest, true);

  const noticeContext = React.useContext(NoticeContext);

  const [createHolding, holdingCreationInfo] = api.useCreateHoldingMutation();

  const holdingCreationStatus = extractStatus(holdingCreationInfo);

  const holdingItems = (holdings?.items ?? []).map((holding) => {
    const prevHolders: Api.Models.Holder[] = [];
    const prevDepartments: Api.Models.Department[] = [];
    for (const id of holding.phoneIds) {
      // Получаем все движения сс по ID средств связи, отсортированные по дате документа
      const prevItems = [...(holdingMap.get(id) ?? [])].sort((a, b) =>
        (a.orderDate as string) < (b.orderDate as string) ? -1 : 1
      );
      // Определяется порядковый номер назначения для СС
      const holdingIndex = prevItems.findIndex(
        (item) => item.id === holding.id
      );
      // Если это не первый владелец, то следует вывести его
      if (holdingIndex > 0) {
        const holder = prevItems[holdingIndex - 1].holder as Api.Models.Holder;
        if (
          holding.holderId !== holder.id &&
          prevHolders.every((h) => h.id !== holder.id)
        ) {
          prevHolders.push(holder);
        }
        const department = departments.get(
          prevItems[holdingIndex - 1].departmentId
        );
        if (
          department &&
          holding.departmentId !== department.id &&
          prevDepartments.every((h) => h.id !== department.id)
        ) {
          prevDepartments.push(department);
        }
      }
    }

    return { ...holding, prevHolders, prevDepartments };
  });

  useNotice(holdingCreationStatus, {
    onSuccess: () => dispatch(push("/holding/commit")),
  });

  const { currentPage, maxPage } = usePaginator(
    offset,
    holdings?.total ?? pageItems,
    pageItems
  );

  return (
    <>
      <TopBarLayer>
        <Paginator
          size={5}
          current={currentPage}
          min={1}
          max={maxPage}
          onChange={(page) => setOffset((page - 1) * pageItems)}
        />
      </TopBarLayer>
      <HoldingPage
        onSubmitHolding={(data) => {
          createHolding(data);
        }}
        // phones={phones?.items ?? []}
        holdings={{ items: holdingItems, offset, total: holdings?.total ?? 0 }}
        // phonesStatus={phonesStatus}
        holdingCreationStatus={holdingCreationStatus}
        holdingsStatus={holdingsStatus}
        filterHook={filterHook}
      />
    </>
  );
};

export default HoldingPageContainer;
