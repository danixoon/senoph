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
import Layout from "components/Layout";
import { api } from "store/slices/api";
import {
  parseItems,
  extractStatus,
  mergeStatuses,
  orStatus,
  useStatus,
} from "store/utils";
import { clearObject, getLocalDate, groupBy } from "utils";
import { TableColumn } from "components/Table";
import { CommitContent } from "./Content";
import InfoBanner from "components/InfoBanner";
import WithLoader from "components/WithLoader";
import Link from "components/Link";
import columns from "utils/columns";
import { useAuthor } from "hooks/misc/author";

const useContainer = () => {
  const [approve, approveInfo] = api.useCommitChangesApproveMutation();
  const [decline, declineInfo] = api.useCommitChangesDeclineMutation();

  const getUser = useAuthor();

  const changes = parseItems(api.useFetchChangesQuery({ target: "phone" }));
  const ids = changes.data.items.map((v) => v.id);
  const phones = parseItems(
    api.useFetchPhonesQuery(
      { ids, offset: 0, amount: ids.length },
      {
        skip: ids.length === 0,
      }
    )
  );

  const updates = changes.data.items.map((update, i) => ({
    id: update.id,
    authorId: update.authorId,
    createdAt: update.createdAt,
    update,
    original: phones.data.items.find((item) => item.id == update.id),
  }));

  return {
    getUser,
    updates: {
      items: updates,
      total: changes.data.total,
      status: mergeStatuses(changes.status, phones.status),
    },
    update: {
      approve,
      decline,
      approveStatus: extractStatus(approveInfo),
      declineStatus: extractStatus(declineInfo),
    },
  };
};

const UpdatedItem: React.FC<{
  original: any;
  update: any;
  name: string;
  mapper?: (v: any) => any;
}> = (props) => {
  const { name, update = {}, original = {}, mapper = (v) => v } = props;

  const updated = typeof update[name] !== "undefined";
  const orig = mapper(original[name]);
  const upd = mapper(update[name]);

  return !updated ? (
    <Span>{orig ?? "Отсутствует"}</Span>
  ) : (
    <>
      <Span strike>{orig ?? "Отсутствует"}</Span>
      <Span>{upd ?? "Отсутствует"}</Span>
    </>
  );
};
const Updates: React.FC<{}> = (props) => {
  const { updates, update, getUser } = useContainer();

  // useNotice(update.approveStatus);
  // useNotice(update.declineStatus);

  type Item = ArrayElement<typeof updates.items>;

  const updateStatus = useStatus(update.approveStatus, update.declineStatus);
  useNotice(updateStatus);

  const tableColumns: TableColumn<Item>[] = [
    {
      key: "actions",
      header: "",
      size: "10px",
      required: true,
      mapper: (v, item) => (
        <ActionBox status={updateStatus}>
          <SpoilerPopupButton
            onClick={() =>
              update.approve({
                target: "phone",
                targetId: item.id,
                userId: item.authorId,
              })
            }
          >
            Подтвердить
          </SpoilerPopupButton>
          <SpoilerPopupButton
            onClick={() =>
              update.decline({
                target: "phone",
                targetId: item.id,
                userId: item.authorId,
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
      size: "10px",
      key: "id",
      mapper: (v, item) => (
        <Link href={`/phone/view?selectedId=${item.id}`}>#{item.id}</Link>
      ),
    },
    {
      header: "Инвентарный номер",
      size: "100px",
      key: "inventoryKey",
      wrap: true,
      mapper: (v, item) => (
        <UpdatedItem
          update={item.update}
          original={item.original}
          name="inventoryKey"
        />
      ),
    },
    {
      header: "Заводской номер",
      size: "100px",
      key: "factoryKey",
      wrap: true,
      mapper: (v, item) => (
        <UpdatedItem
          update={item.update}
          original={item.original}
          name="factoryKey"
        />
      ),
    },
    {
      header: "Год сборки",
      size: "100px",
      key: "assemblyDate",
      wrap: true,
      mapper: (v, item) => (
        <UpdatedItem
          update={item.update}
          original={item.original}
          name="assemblyDate"
          mapper={(v) => new Date(v).getFullYear()}
        />
      ),
    },
    {
      header: "Дата учёта",
      size: "100px",
      key: "accountingDate",
      wrap: true,
      mapper: (v, item) => (
        <UpdatedItem
          update={item.update}
          original={item.original}
          name="accountingDate"
          mapper={(v) => new Date(v).toLocaleDateString()}
        />
      ),
    },
    {
      header: "Дата ввода в эксплуатацию",
      size: "100px",
      key: "commissioningDate",
      wrap: true,
      mapper: (v, item) => (
        <UpdatedItem
          update={item.update}
          original={item.original}
          name="commissioningDate"
          mapper={(v) => new Date(v).toLocaleDateString()}
        />
      ),
    },
    ...(columns.entityDates({ withoutUpdate: true }) as any),
    columns.author({ getUser }),
  ];

  return (
    <>
      {/* <TopBarLayer>
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
      </TopBarLayer> */}
      <InfoBanner
        href="/phone/edit"
        text="Изменения средств связи отсутствуют. Вы можете создать их на странице"
        hrefContent="управления средствами связи"
        disabled={updates.items.length > 0 || updates.status.isLoading}
      >
        <WithLoader status={updates.status}>
          <Header align="right">Элементы ({updates.total})</Header>
          <CommitContent
            onCommit={(ids, action) => {}}
            items={updates.items}
            columns={tableColumns}
          >
            {/* <Layout>
          <Header unsized bottom align="right">
            Фильтр
          </Header>
        </Layout> */}
          </CommitContent>
        </WithLoader>
      </InfoBanner>
    </>
  );
};

export default Updates;
