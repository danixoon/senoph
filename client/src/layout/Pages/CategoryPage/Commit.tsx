import { api } from "store/slices/api";
import Icon, { LoaderIcon } from "components/Icon";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";

import { useAuthor } from "hooks/misc/author";
import React from "react";
import { extractStatus, parseItems } from "store/utils";

import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { getColumns } from "./utils";
import { useSelection } from "hooks/useSelection";
import columns from "utils/columns";
import Badge from "components/Badge";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import TopBarLayer from "providers/TopBarLayer";

const useContainer = () => {
  const fetchCategories = api.useFetchCategoriesQuery({ pending: true });

  const [commitCategory, status] = api.useCommitCategoryMutation();
  const { holders, departments } = useFetchConfigMap();

  return {
    categories: parseItems(fetchCategories),
    category: { commit: commitCategory, status },
  };
};

export const CommitContent: React.FC<{}> = (props) => {
  const { categories, category } = useContainer();

  const handleCommit = (action: CommitActionType, ids: number[]) =>
    !category.status.isLoading && category.commit({ action, ids });

  const selection = useSelection<number>(categories.data.items);

  const actionBox: TableColumn<Api.Models.Category> = {
    key: "actions",
    header: "",
    size: "30px",
    required: true,
    mapper: (v, item) => (
      <ActionBox status={extractStatus(category.status)}>
        <SpoilerPopupButton onClick={() => handleCommit("approve", [item.id])}>
          Подтвердить
        </SpoilerPopupButton>
        <SpoilerPopupButton onClick={() => handleCommit("decline", [item.id])}>
          Отменить
        </SpoilerPopupButton>
      </ActionBox>
    ),
  };

  const getUser = useAuthor();

  return (
    <>
      {categories.data.items.length === 0 ? (
        <InfoBanner
          href="/phone/edit"
          hrefContent="средство связи"
          text="Акты категорий для потдверждения отсутствуют. Создайте их, выбрав"
        />
      ) : (
        <>
          <TopBarLayer>
            <ButtonGroup>
              <Button
                disabled={
                  selection.selection.length === 0 || category.status.isLoading
                }
                margin="none"
                onClick={() => handleCommit("approve", selection.selection)}
              >
                Подтвердить
              </Button>
              <Badge
                margin="none"
                color="secondary"
                style={{ borderRadius: 0 }}
              >
                {category.status.isLoading ? (
                  <LoaderIcon />
                ) : (
                  selection.selection.length
                )}
              </Badge>
              <Button
                disabled={
                  selection.selection.length === 0 ||
                  category.status.isLoading
                }
                margin="none"
                onClick={() => handleCommit("decline", selection.selection)}
              >
                Отменить
              </Button>
            </ButtonGroup>
          </TopBarLayer>
          <Table
            columns={[
              actionBox,
              ...getColumns(getUser),
              columns.selection({ selection }),
            ]}
            items={categories.data.items}
          />
        </>
      )}
    </>
  );
};
