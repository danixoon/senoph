import ActionBox from "components/ActionBox";
import Badge from "components/Badge";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Checkbox from "components/Checkbox";
import Dropdown from "components/Dropdown";
import Header from "components/Header";
import { LoaderIcon } from "components/Icon";
import Paginator from "components/Paginator";
import Span from "components/Span";
import { SpoilerPopupButton } from "components/SpoilerPopup";
import { useNotice } from "hooks/useNotice";
import { usePaginator } from "hooks/usePaginator";
import { useQueryInput } from "hooks/useQueryInput";
import TopBarLayer from "providers/TopBarLayer";
import { getDefaultColumns as getPhonePageColumns } from "../PhonePage/Items";
import React from "react";
import { api } from "store/slices/api";
import { parseItems, extractStatus } from "store/utils";
import { clearObject, getLocalDate } from "utils";
import { TableColumn } from "components/Table";
import { CommitContent } from "./Content";
import Layout from "components/Layout";
import { useAuthor } from "hooks/misc/author";

const useActionsContainer = (
  query: { status?: CommitStatus; amount?: number; offset?: number } = {}
) => {
  const { status, amount, offset } = query;
  const commits = api.useFetchPhonesCommitQuery({ status, amount, offset });
  const [commitPhone, commitPhoneInfo] = api.useCommitPhoneMutation();
  return {
    commits: parseItems(commits),
    commit: commitPhone,
    status: extractStatus(commitPhoneInfo),
  };
};
const Actions: React.FC<{}> = (props) => {
  type ItemType = ArrayElement<typeof commits.data.items>;
  type FilterType = { status?: CommitStatus };

  const [selectedIds, setSelection] = React.useState<number[]>(() => []);

  // const [bindFilter, setFilter] = useInput<FilterType>({
  //   status: null,
  // });

  const [bindQuery, setQuery] = useQueryInput<FilterType>({});
  const [offset, setOffset] = React.useState(() => 0);

  const { commits, commit, status } = useActionsContainer({
    amount: 15,
    offset,
    ...clearObject(bindQuery.input as any),
  });

  React.useEffect(() => {
    const updatedSelection: number[] = [];
    for (const commit of commits.data.items)
      if (selectedIds.includes(commit.id)) updatedSelection.push(commit.id);

    setSelection(updatedSelection);
  }, [commits.data.items.map((v) => v.id).join("_")]);

  const getUser = useAuthor();
  const columns: TableColumn<ItemType>[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      required: true,
      mapper: (v, item) => (
        <ActionBox status={status}>
          <SpoilerPopupButton
            onClick={() => commit({ ids: [item.id], action: "approve" })}
          >
            Подтвердить
          </SpoilerPopupButton>
          <SpoilerPopupButton
            onClick={() => commit({ ids: [item.id], action: "decline" })}
          >
            Отменить
          </SpoilerPopupButton>
        </ActionBox>
      ),
    },
    ...getPhonePageColumns(getUser),
    {
      key: "statusAt",
      header: "Добавлено",
      size: "100px",
      mapper: (v, item) => {
        return getLocalDate(item.createdAt);
      },
    },
    {
      key: "status",
      header: "Статус",
      mapper: (v, item) =>
        item.status === "create-pending" ? (
          <Span weight="bold">Создание</Span>
        ) : item.status === "delete-pending" ? (
          <Span weight="bold" color="primary">
            Удаление
          </Span>
        ) : (
          item.status
        ),
    },

    {
      required: true,
      header: (
        <Checkbox
          name="selectedAll"
          input={{
            selectedAll: selectedIds.length === commits.data.items.length,
          }}
          onChange={(e) => {
            setSelection(
              selectedIds.length === commits.data.items.length
                ? []
                : commits.data.items.map((item) => item.id)
            );
          }}
        />
      ),
      props: { style: { textAlign: "center" } },
      mapper: (v, item) => {
        const isSelected = selectedIds.includes(item.id);

        if (isSelected && status.isLoading) return <LoaderIcon />;

        return (
          <Checkbox
            containerProps={{ style: { margin: 0 } }}
            name="isSelected"
            input={{
              isSelected,
            }}
            onChange={(e) =>
              e.target.checked
                ? setSelection([...selectedIds, item.id])
                : setSelection(selectedIds.filter((v) => v !== item.id))
            }
          />
        );
      },
      key: "selectedIds",
      size: "30px",
    },
  ];

  useNotice(status, {
    // success: "",
  });

  const { maxPage, currentPage } = usePaginator(offset, setOffset, commits.data.total, 15);

  React.useEffect(() => {
    setOffset(0);
  }, [bindQuery.input.status]);

  return (
    <>
      <TopBarLayer>
        <ButtonGroup>
          <Button
            disabled={selectedIds.length === 0 || status.isLoading}
            margin="none"
            onClick={() => commit({ ids: selectedIds, action: "approve" })}
          >
            Подтвердить
          </Button>
          <Badge margin="none" color="secondary" style={{ borderRadius: 0 }}>
            {status.isLoading ? <LoaderIcon /> : selectedIds.length}
          </Badge>
          <Button
            disabled={selectedIds.length === 0 || status.isLoading}
            margin="none"
            onClick={() => commit({ ids: selectedIds, action: "decline" })}
          >
            Отменить
          </Button>
        </ButtonGroup>
        <Paginator
          onChange={(page) => setOffset((page - 1) * 15)}
          min={1}
          max={maxPage}
          size={5}
          current={currentPage}
        />
      </TopBarLayer>
      <CommitContent
        onCommit={(ids, action) => commit({ ids, action })}
        items={commits.data.items}
        columns={columns}
      >
        <Layout>
          <Header unsized bottom align="right">
            Фильтр
          </Header>
          <Dropdown
            {...bindQuery}
            label="Статус действия"
            name="status"
            items={[
              { label: "Удаления", id: "delete-pending" },
              { label: "Создания", id: "create-pending" },
            ]}
          />
        </Layout>
      </CommitContent>
    </>
  );
};

export default Actions;
