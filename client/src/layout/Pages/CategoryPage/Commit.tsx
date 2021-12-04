import { api } from "store/slices/api";
import Icon from "components/Icon";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import React from "react";
import { extractStatus, parseItems } from "store/utils";

import ActionBox from "components/ActionBox";
import InfoBanner from "components/InfoBanner";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { getColumns } from "./utils";

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

  const handleCommit = (action: CommitActionType, id: number) =>
    !category.status.isLoading && category.commit({ action, ids: [id] });

  const actionBox: TableColumn<Api.Models.Category> = {
    key: "actions",
    header: "",
    size: "30px",
    mapper: (v, item) => (
      <ActionBox status={extractStatus(category.status)}>
        <SpoilerPopupButton onClick={() => handleCommit("approve", item.id)}>
          Подтвердить
        </SpoilerPopupButton>
        <SpoilerPopupButton onClick={() => handleCommit("decline", item.id)}>
          Отменить
        </SpoilerPopupButton>
      </ActionBox>
    ),
  };

  return (
    <>
      {categories.data.items.length === 0 ? (
        <InfoBanner
          href="/phone/edit"
          hrefContent="средство связи"
          text="Движения для потдверждения отсутствуют. Создайте их, выбрав"
        />
      ) : (
        <Table
          columns={[actionBox, ...getColumns()]}
          items={categories.data.items}
        />
      )}
    </>
  );
};
