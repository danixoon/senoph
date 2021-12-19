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
import { useTogglePayloadPopup } from "hooks/useTogglePopup";
import PhonesHoldingSelectionPopup from "layout/Popups/PhonesHoldingSelectionPopup";
import PopupLayer from "providers/PopupLayer";
import { useNotice } from "hooks/useNotice";
import WithLoader from "components/WithLoader";
import Input from "components/Input";
import { useQueryInput } from "hooks/useQueryInput";
import { clearObject } from "utils";
import PhonesCategorySelectionPopup from "layout/Popups/PhonesCategorySelectionPopup";

const useContainer = () => {
  const [bindQuery] = useQueryInput<any>({ ids: "" });

  const fetchCategories = api.useFetchCategoriesQuery(
    clearObject({ pending: true, ids: bindQuery.input.ids })
  );

  const [commitCategory, status] = api.useCommitCategoryMutation();
  const { holders, departments } = useFetchConfigMap();

  return {
    categories: parseItems(fetchCategories),
    category: { commit: commitCategory, status: extractStatus(status) },
    bindQuery,
  };
};

export const CommitContent: React.FC<{}> = (props) => {
  const { categories, category, bindQuery } = useContainer();

  const handleCommit = (action: CommitActionType, ids: number[]) =>
    !category.status.isLoading && category.commit({ action, ids });

  useNotice(category.status);

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
  const phonesPopup = useTogglePayloadPopup();

  return (
    <>
      <PopupLayer>
        <PhonesCategorySelectionPopup {...phonesPopup} categoryId={phonesPopup.state} />
      </PopupLayer>
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
          <Badge margin="none" color="secondary" style={{ borderRadius: 0 }}>
            {category.status.isLoading ? (
              <LoaderIcon />
            ) : (
              selection.selection.length
            )}
          </Badge>
          <Button
            disabled={
              selection.selection.length === 0 || category.status.isLoading
            }
            margin="none"
            onClick={() => handleCommit("decline", selection.selection)}
          >
            Отменить
          </Button>
        </ButtonGroup>
        <Input placeholder="Идентификатор" name="ids" {...bindQuery} />
      </TopBarLayer>
      <WithLoader status={categories.status}>
        <InfoBanner
          disabled={categories.data.total > 0}
          href="/phone/edit"
          hrefContent="средство связи"
          text="Акты категорий для потдверждения отсутствуют. Создайте их, выбрав"
        >
          <Table
            columns={[
              actionBox,
              ...getColumns(getUser, (id) => phonesPopup.onToggle(true, id)),
              columns.selection({ selection }),
            ]}
            items={categories.data.items}
          />
        </InfoBanner>
      </WithLoader>
    </>
  );
};
