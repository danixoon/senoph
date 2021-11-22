import { useQueryInput } from "hooks/useQueryInput";
import HoldingPage from "layout/Pages/HoldingPage";
import { NoticeContext } from "providers/NoticeProvider";
import React from "react";
import { QueryStatus } from "react-query";
import { getStatusProps } from "react-query/types/core/utils";
import { useAppDispatch, useAppSelector } from "store";
import { api } from "store/slices/api";
import { extractStatus, isApiError } from "store/utils";

type Props = {};
const HoldingPageContainer: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();

  const [bind] = useQueryInput<{ phoneIds: "" }>({ phoneIds: null });

  const phoneIds =
    bind.input.phoneIds?.split(",").map((id) => Number(id)) ?? [];

  const { data: phones, ...phonesRest } = api.useFetchPhonesQuery(
    {
      amount: phoneIds.length,
      offset: 0,
      ids: phoneIds,
    },
    { skip: (bind.input.phoneIds?.length ?? 0) === 0 }
  );

  const { data: holdings, ...holdingsRest } = api.useFetchHoldingsQuery({});

  const holdingPhoneIds = Array.from(
    // TODO: Flat map..?
    (holdings?.items ?? [])
      .reduce(
        (set, v) => v.phoneIds.reduce((set, id) => set.add(id), set),
        new Set<number>()
      )
      .values()
  );
  const { data: phoneHoldings, ...phoneHoldingsRest } =
    api.useFetchPhoneHoldingsQuery(
      {
        phoneIds: holdingPhoneIds,
      },
      { skip: (holdings?.items ?? []).length === 0 }
    );

  const holdingMap = new Map<number, Api.Models.Holding[]>();
  for (const holding of phoneHoldings?.items ?? []) {
    for (const phoneId of holding.phoneIds) {
      // const { phoneIds, ...rest } = holding;
      // if(holding)
      const holdingList = holdingMap.get(phoneId) ?? [];
      // const last = holdingList[holdingList.length - 1] ?? { createdAt: NaN };
      holdingMap.set(
        phoneId,
        // (last.createdAt as string) < (holding.createdAt as string)
        [...holdingList, holding]
        // : [holding, ...holdingList]
      );
    }
  }

  const phonesStatus = extractStatus(phonesRest);
  const holdingsStatus = extractStatus(holdingsRest);

  const noticeContext = React.useContext(NoticeContext);

  const [createHolding, holdingCreationInfo] = api.useCreateHoldingMutation();

  const holdingCreationStatus = extractStatus(holdingCreationInfo);

  const holdingItems = (holdings?.items ?? []).map((holding) => {
    const prevHolders: Api.Models.Holder[] = [];
    for (const id of holding.phoneIds) {
      // TODO: Проверить даты и прочую чушь
      const prevItem = [...(holdingMap.get(id) ?? [])].sort((a, b) =>
        (a.createdAt as string) > (b.createdAt as string) ? -1 : 1
      )[0];
      if (!prevItem || prevItem.holderId === holding.holderId) continue;

      if (
        prevItem?.holder &&
        !prevHolders.find((h) => h.id === prevItem.holderId)
      )
        prevHolders.push(prevItem.holder as Api.Models.Holder);
    }

    return { ...holding, prevHolders };
  });

  React.useEffect(() => {
    if (holdingCreationStatus.isLoading)
      noticeContext.createNotice("Движение создаётся..");
    if (holdingCreationStatus.isSuccess)
      noticeContext.createNotice("Движение создано.");
    if (holdingCreationStatus.isError)
      noticeContext.createNotice(
        "Ошибка создание движения: " + holdingCreationStatus.error?.message,
        "danger"
      );
  }, [holdingCreationInfo.status]);

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
    />
  );
};

export default HoldingPageContainer;
