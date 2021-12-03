import { push } from "connected-react-router";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import { useNotice } from "hooks/useNotice";
import { useQueryInput } from "hooks/useQueryInput";
import HoldingPage from "layout/Pages/HoldingPage";
import { NoticeContext } from "providers/NoticeProvider";
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

  const [bind] = useQueryInput<
    Partial<
      Record<
        | "holderId"
        | "departmentId"
        | "orderDate"
        | "orderKey"
        | "status"
        | "phoneIds",
        string
      >
    >
  >({});

  const phoneIds =
    bind.input.phoneIds?.split(",").map((id) => Number(id)) ?? [];

  const { data: phones, ...phonesRest } = api.useFetchPhonesQuery(
    {
      amount: phoneIds.length,
      offset: 0,
      ids: phoneIds.length > 0 ? undefined : phoneIds,
    },
    { skip: (bind.input.phoneIds?.length ?? 0) === 0 }
  );

  const filterHook = useQueryInput<{ orderKey?: string; orderDate?: string }>(
    {}
  );

  const [bindFilter] = filterHook;

  // TODO: Possible weak?
  const filterData = clearObject(bindFilter.input) as any;
  const { data: holdings, ...holdingsRest } = api.useFetchHoldingsQuery({
    ...filterData,
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

  const phonesStatus = extractStatus(phonesRest);
  const holdingsStatus = extractStatus(holdingsRest);

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

  return (
    <HoldingPage
      onSubmitHolding={(data) => {
        createHolding(data);
      }}
      phones={phones?.items ?? []}
      holdings={holdingItems}
      phonesStatus={phonesStatus}
      holdingCreationStatus={holdingCreationStatus}
      holdingsStatus={holdingsStatus}
      filterHook={filterHook}
    />
  );
};

export default HoldingPageContainer;
