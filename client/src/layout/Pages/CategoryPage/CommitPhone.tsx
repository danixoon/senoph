import { api } from "store/slices/api";
import Icon from "components/Icon";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { extractStatus, parseItems } from "store/utils";

import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";

import { extractItemsHook, getLocalDate } from "utils";
import Link from "components/Link";
import Span from "components/Span";

const useContainer = () => {
  const { holders, departments } = useFetchConfigMap();
  const [commit, commitInfo] = api.useCommitCategoryPhoneMutation();
  const categoryPhoneCommits = parseItems(
    api.useFetchCategoryPhoneCommitsQuery({})
  );

  const categories = parseItems(
    api.useFetchCategoriesQuery(
      { ids: categoryPhoneCommits.data.items.map((v) => v.categoryId) },
      { skip: categoryPhoneCommits.data.items.length === 0 }
    )
  );

  const mappedCategories = categoryPhoneCommits.data.items.map((item) => {
    const targetCategory = categories.data.items.find(
      (cat) => cat.id === item.categoryId
    );
    return { ...item, ...targetCategory };
  });

  return {
    categoryPhoneCommits,
    commit,
    commitStatus: extractStatus(commitInfo),
    holders,
    departments,
    categories: mappedCategories,
  };
};

export const CommitPhoneContent: React.FC<{}> = (props) => {
  const { categories, commit, commitStatus, departments, holders } =
    useContainer();

  const columns: TableColumn<ArrayElement<typeof categories>>[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      required: true,
      mapper: (v, item) => (
        <ActionBox icon={Icon.Box} status={commitStatus}>
          <SpoilerPopupButton
            onClick={() =>
              commit({
                action: "approve",
                categoryId: item.categoryId,
                phoneIds: item.commits.map((c) => c.phoneId),
              })
            }
          >
            Подтвердить
          </SpoilerPopupButton>
          <SpoilerPopupButton
            onClick={() =>
              commit({
                action: "decline",
                categoryId: item.categoryId,
                phoneIds: item.commits.map((c) => c.phoneId),
              })
            }
          >
            Отменить
          </SpoilerPopupButton>
        </ActionBox>
      ),
    },
    {
      header: "ID",
      key: "id",
      size: "30px",
      mapper: (v, item) => (
        <Link href={`/category/view#${item.categoryId}`}>
          #{item.categoryId}
        </Link>
      ),
    },
    {
      header: "Номер акта",
      key: "actKey",
      size: "150px",
      mapper: (v, item) => item.actKey,
    },
    {
      header: "Дата акта",
      key: "actDate",
      size: "150px",
      type: "date",
      mapper: (v, item) => item.actDate,
    },
    {
      key: "addedIds",
      header: "Изменения",
      props: { style: { whiteSpace: "normal" } },
      mapper: (v, row) => {
        return row.commits.map((item, i) => (
          <>
            <Link
              style={{ display: "inline" }}
              href={`/phone/view?selectedId=${item.phoneId}`}
            >
              <Span inline strike={item.status === "delete-pending"}>
                {`#${item.phoneId}`}
              </Span>
            </Link>
            {i !== row.commits.length - 1 ? ", " : ""}
          </>
        ));
      },
    },
    {
      header: "Дата изменения",
      key: "statusDate",
      size: "150px",
      // type: "date",
      mapper: (v, item) =>
        getLocalDate(
          new Date(
            Math.max(
              ...item.commits.map((v) => new Date(v.statusAt ?? 0).getTime())
            )
          )
        ),
    },
  ];

  return (
    <>
      {categories.length === 0 ? (
        <InfoBanner text="Изменения категорий отсутствуют." />
      ) : (
        <Table columns={columns} items={categories} />
      )}
    </>
  );
};
