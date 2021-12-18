import { api } from "store/slices/api";
import Icon, { LoaderIcon } from "components/Icon";
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
import { useAuthor } from "hooks/misc/author";
import columnTypes from "utils/columns";
import { useSelection } from "hooks/useSelection";
import TopBarLayer from "providers/TopBarLayer";
import ButtonGroup from "components/ButtonGroup";
import Button from "components/Button";
import Badge from "components/Badge";
import { useNotice } from "hooks/useNotice";

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

  const getUser = useAuthor();

  return {
    categoryPhoneCommits,
    commit,
    commitStatus: extractStatus(commitInfo),
    holders,
    departments,
    categories: mappedCategories,
    getUser,
  };
};

export const CommitPhoneContent: React.FC<{}> = (props) => {
  const { categories, getUser, commit, commitStatus, departments, holders } =
    useContainer();

  useNotice(commitStatus);

  const selection = useSelection(categories as any);

  const commitSelected = (action: CommitActionType) => {
    const payloads: any[] = [];
    const targetCategories = categories.filter((v) =>
      selection.selection.includes(v.id)
    );

    for (const cat of targetCategories) {
      payloads.push({
        action,
        categoryId: cat.id,
        phoneIds: cat.commits.map((v) => v.phoneId),
      });
    }

    for (const payload of payloads) {
      commit(payload);
    }
  };

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
    columnTypes.selection({ selection }),
    columnTypes.author({ getUser }),
  ];

  return (
    <>
      {categories.length === 0 ? (
        <InfoBanner text="Изменения категорий отсутствуют." />
      ) : (
        <>
          <TopBarLayer>
            <ButtonGroup>
              <Button
                disabled={
                  selection.selection.length === 0 || commitStatus.isLoading
                }
                margin="none"
                onClick={() => commitSelected("approve")}
              >
                Подтвердить
              </Button>
              <Badge
                margin="none"
                color="secondary"
                style={{ borderRadius: 0 }}
              >
                {commitStatus.isLoading ? (
                  <LoaderIcon />
                ) : (
                  selection.selection.length
                )}
              </Badge>
              <Button
                disabled={
                  selection.selection.length === 0 || commitStatus.isLoading
                }
                margin="none"
                onClick={() => commitSelected("decline")}
              >
                Отменить
              </Button>
            </ButtonGroup>
          </TopBarLayer>
          <Table columns={columns} items={categories} />
        </>
      )}
    </>
  );
};
