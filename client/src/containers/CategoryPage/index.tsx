import { useQueryInput } from "hooks/useQueryInput";
import CategoryPage from "layout/Pages/CategoryPage";
import HoldingPage from "layout/Pages/HoldingPage";
import { NoticeContext } from "providers/NoticeProvider";
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

  const phonesStatus = extractStatus(phonesRest);
  const categoriesStatus = extractStatus(categoriesRest);

  const [createCategory, categoryCreationInfo] =
    api.useCreateCategoryMutation();

  const noticeContext = React.useContext(NoticeContext);

  const categoryCreationStatus = extractStatus(categoryCreationInfo);

  React.useEffect(() => {
    if (categoryCreationStatus.isLoading)
      noticeContext.createNotice("Категория создаётся..");
    if (categoryCreationStatus.isSuccess)
      noticeContext.createNotice("Категория создана.");
    if (categoryCreationStatus.isError)
      noticeContext.createNotice(
        "Ошибка создания категории: " + categoryCreationStatus.error?.message
      );
  }, [categoryCreationInfo.status]);

  return (
    <CategoryPage
      onSubmitCategory={(data) => {
        createCategory(data);
      }}
      phones={phones?.items ?? []}
      categories={categories?.items ?? []}
      phonesStatus={phonesStatus}
      categoriesStatus={categoriesStatus}
      categoryCreationStatus={categoryCreationStatus}
      categoriesPhones={categoriesPhonesMap}
    />
  );
};

export default CategoryPageContainer;
