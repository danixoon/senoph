import qs from "query-string";
import ActionBox from "components/ActionBox";
import Badge from "components/Badge";
import Link from "components/Link";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { useTogglePopup } from "hooks/useTogglePopup";
import ItemSelectionPopup from "layout/Popups/ItemSelectionPopup";
import { NoticeContext } from "providers/NoticeProvider";
import PopupLayer from "providers/PopupLayer";
import React from "react";
import { useLocation } from "react-router";
import { resolveStatusName } from "resolvers/commit";
import { useAppDispatch } from "store";
import { api } from "store/slices/api";
import { extractStatus, parseItems, updateQuery } from "store/utils";
import { clearObject, getLocalDate } from "utils";
import { categoryNames, getColumns, resolveCategoryName } from "./utils";
import Button from "components/Button";
import Icon from "components/Icon";
import Span from "components/Span";
import { push, replace } from "connected-react-router";
import ClickInput from "components/ClickInput";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import InfoBanner from "components/InfoBanner";
import Input from "components/Input";
import { useQueryInput } from "hooks/useQueryInput";
import WithLoader from "components/WithLoader";

const useContainer = () => {
  const filterHook = useQueryInput<{
    actKey?: string;
    actDate?: string;
    categoryKey?: CategoryKey;
    status?: CommitStatus | "based";
  }>({});

  // const input = filterHook[0].input;

  const fetchedCategories = api.useFetchCategoriesQuery({
    ...clearObject(filterHook[0].input as any),
  });

  const categories = parseItems(fetchedCategories);

  const location = useLocation<any>();
  const { id, ...query } = qs.parse(location.search);

  const selectedId = parseInt(id as string);

  const phoneIds: number[] = [];

  if (!isNaN(selectedId)) {
    const targetCategory = categories.data.items.find(
      (item) => item.id.toString() === selectedId.toString()
    );
    if (targetCategory) phoneIds.push(...targetCategory.phoneIds);
  }

  const fetchedCategoryPhones = api.useFetchPhonesQuery(
    { ids: phoneIds, offset: 0, amount: phoneIds.length },
    { skip: phoneIds.length === 0 }
  );

  const [commitCategory, commitCategoryInfo] =
    api.useCreateCategoryChangeMutation();

  const dispatch = useAppDispatch();

  const [deleteCategory, deleteCategoryInfo] = api.useDeleteCategoryMutation();

  const isSelecting = location.state?.act === "select";

  return {
    filterHook,
    categories,
    category: {
      commit: commitCategory,
      delete: deleteCategory,
      commitStatus: extractStatus(commitCategoryInfo),
      deleteStatus: extractStatus(deleteCategoryInfo),
    },
    categoryPhones: parseItems(fetchedCategoryPhones),
    selectedId,
    onSelect: isSelecting
      ? (item: { id: any }) => {
          const { referrer, referrerSearch } = location.state ?? {};
          if (!referrer) return;
          dispatch(
            push({
              pathname: referrer,
              search: referrerSearch,
              state: { selectedId: item.id },
            })
          );
        }
      : undefined,
    onToggle: () => dispatch(replace({ search: qs.stringify(query) })),
    onViewCommit: (id: number) => dispatch(push("/category/commit")),
    onEdit: (id: number) =>
      dispatch(push({ search: qs.stringify({ ...query, id }) })),
  };
};

export const ViewContent: React.FC<{}> = (props) => {
  const {
    filterHook,
    category,
    categories,
    categoryPhones,
    selectedId,
    onToggle,
    onViewCommit,
    onEdit,
    onSelect,
  } = useContainer();

  const actionBox: TableColumn = {
    key: "actions",
    header: "",
    size: "30px",
    mapper: (v, item) => (
      <ActionBox key="ok" icon={Icon.Box} status={category.deleteStatus}>
        {item.status !== null ? (
          <>
            <SpoilerPopupButton onClick={() => onViewCommit(item.id)}>
              Просмотреть
            </SpoilerPopupButton>
            <SpoilerPopupButton onClick={() => onEdit(item.id)}>
              Изменить
            </SpoilerPopupButton>
          </>
        ) : (
          <>
            <SpoilerPopupButton onClick={() => onEdit(item.id)}>
              Изменить
            </SpoilerPopupButton>
            <SpoilerPopupButton
              onClick={() => category.delete({ id: item.id })}
            >
              Удалить
            </SpoilerPopupButton>
          </>
        )}
      </ActionBox>
    ),
  };

  const noticeContext = React.useContext(NoticeContext);
  const [bindFilter] = filterHook;

  return (
    <>
      <PopupLayer>
        <ItemSelectionPopup
          onToggle={() => onToggle()}
          isOpen={!isNaN(selectedId)}
          header="Прикреплённые средства связи"
          onSelect={(item) => {}}
          status={categoryPhones.status}
          items={categoryPhones.data.items.map((item) => ({
            id: item.id.toString(),
            content: (
              <>
                <Button
                  onClick={() => {
                    if (categoryPhones.data.items.length === 1)
                      noticeContext.createNotice(
                        "Ошибка: Невозможно удалить последнее средство связи из категории. \nВероятно, вы хотите удалить категорию полностью?"
                      );
                    else if (selectedId)
                      category.commit({
                        action: "remove",
                        phoneIds: [item.id],
                        categoryId: selectedId,
                      });
                  }}
                  inverted
                  style={{ marginRight: "1rem" }}
                >
                  <Icon.X />
                </Button>
                <Link href={`/phone/view?selectedId=${item.id}`}>
                  {item.model?.name ?? `#${item.id}`}
                </Link>
                <Span
                  size="xs"
                  style={{ marginLeft: "auto", marginRight: "1rem" }}
                  font="monospace"
                >
                  {item.inventoryKey ?? "Инвентарный отсутствует"}
                </Span>
              </>
            ),
            name: item.model?.name ?? `#${item.id}`,
          }))}
        />
      </PopupLayer>
      <Form style={{ flexFlow: "column wrap", maxHeight: "100px" }} input={{}}>
        <Input
          {...bindFilter}
          name="actKey"
          label="Номер акта"
          placeholder="1234"
        />
        <Input
          {...bindFilter}
          type="date"
          name="actDate"
          label="Дата акта"
          blurrable
        />
        <Dropdown
          {...bindFilter}
          style={{ flex: "1" }}
          items={Object.entries(categoryNames).map(([id, label]) => ({
            label,
            id,
          }))}
          name="categoryKey"
          label="Категория"
        />
        <Dropdown
          {...bindFilter}
          style={{ flex: "1" }}
          items={[
            { id: "create-pending", label: "Ожидает создания" },
            { id: "delete-pending", label: "Ожидает удаления" },
            { id: "based", label: "Подтверждённые" },
          ]}
          name="status"
          label="Статус"
        />
      </Form>
      <Hr />

      <WithLoader status={categories.status}>
        {categories.data.items.length === 0 ? (
          <InfoBanner
            href="/phone/edit"
            hrefContent="средства связи"
            text="Движения по запросу отсутствуют. Вы можете создать их, выбрав"
          />
        ) : (
          <>
            <Header align="right">
              Результаты ({categories.data.items.length})
            </Header>
            <Table
              items={categories.data.items}
              columns={[actionBox, ...getColumns()]}
              onSelect={onSelect}
            />
          </>
        )}
      </WithLoader>
    </>
  );
};
