import { useQueryInput } from "hooks/useQueryInput";
import CategoryPage from "layout/Pages/CategoryPage";
import HoldingPage from "layout/Pages/HoldingPage";
import React from "react";
import { QueryStatus } from "react-query";
import { getStatusProps } from "react-query/types/core/utils";
import { useAppDispatch, useAppSelector } from "store";
import { api } from "store/slices/api";
import { extractStatus, isApiError } from "store/utils";

type Props = {};
const CategoryPageContainer: React.FC<Props> = (props) => {
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

  const { data: categories, ...categoriesRest } = api.useFetchCategoriesQuery({
    status: "create-pending",
  });

  const { data: categoriesPhones, ...categoriesPhonesRest } =
    api.useFetchPhonesQuery(
      {
        amount: categories?.total ?? 0,
        offset: 0,
        ids: (categories?.items ?? []).map((cat) => cat.phoneId),
      },
      {
        skip:
          !categories ||
          !categoriesRest.isSuccess ||
          categories.items.length === 0,
      }
    );

  const categoriesPhonesMap = new Map<number, Api.Models.Phone>();

  for (const phone of categoriesPhones?.items ?? [])
    categoriesPhonesMap.set(phone.id, phone);

  // const holdingPhoneIds = Array.from(
  //   // TODO: Flat map..?
  //   (categories?.items ?? [])
  //     .reduce((set, v) => set.add(v.phoneId), new Set<number>())
  //     .values()
  // );
  // const { data: phoneHoldings, ...phoneHoldingsRest } =
  //   api.useFetchPhoneHoldingsQuery(
  //     {
  //       phoneIds: holdingPhoneIds,
  //     },
  //     { skip: (categories?.items ?? []).length === 0 }
  //   );

  // const categoriesMap = new Map<number, Api.Models.PhoneCategory[]>();
  // for (const holding of phoneHoldings?.items ?? []) {
  //   for (const phoneId of holding.phoneIds) {
  //     // const { phoneIds, ...rest } = holding;
  //     // if(holding)
  //     const holdingList = categoriesMap.get(phoneId) ?? [];
  //     categoriesMap.set(phoneId, [...holdingList, holding]);
  //   }
  // }

  const phonesStatus = extractStatus(phonesRest);
  const categoriesStatus = extractStatus(categoriesRest);

  const [createCategory] = api.useCreateCategoryMutation();

  return (
    <CategoryPage
      onSubmitCategory={(data) => {
        createCategory(data);
      }}
      phones={phones?.items ?? []}
      categories={categories?.items ?? []}
      phonesStatus={phonesStatus}
      categoriesStatus={categoriesStatus}
      categoriesPhones={categoriesPhonesMap}
    />
  );
};

export default CategoryPageContainer;
