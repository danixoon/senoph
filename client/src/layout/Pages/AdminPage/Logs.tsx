import ReactJson from "react-json-view";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import Link from "components/Link";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { useAuthor } from "hooks/misc/author";
import { useInput } from "hooks/useInput";
import React from "react";
import { api } from "store/slices/api";
import columns from "utils/columns";
import { useTogglePayloadPopup } from "hooks/useTogglePopup";
import PopupLayer from "providers/PopupLayer";
import Span from "components/Span";
import { usePaginator } from "hooks/usePaginator";
import { parseItems } from "store/utils";
import Paginator from "components/Paginator";
import TopBarLayer from "providers/TopBarLayer";

export type LogsProps = {};

const DetailsPopup: React.FC<PopupProps & { payload?: any }> = (props) => {
  const { payload, ...rest } = props;
  return (
    <Popup {...rest} size="md">
      <PopupTopBar>
        <Layout flex="1">
          <Header align="right">Подробности</Header>
          <Hr />
        </Layout>
      </PopupTopBar>
      {payload ? (
        <ReactJson
          displayDataTypes={false}
          name={null}
          displayObjectSize={false}
          src={payload}
        />
      ) : (
        <Span> Отсутствуют </Span>
      )}
    </Popup>
  );
};

const pageItems = 30;

const useContainer = (offset: number) => {
  const logs = parseItems(api.useFetchLogsQuery({ offset, amount: pageItems }));

  const getUser = useAuthor();

  return {
    logs,
    getUser,
  };
};

const resolveTypeMap: Record<DB.LogType, string> = {
  commit: "Ожидание подтверждения",
  create: "Создание",
  delete: "Удаление",
  edit: "Изменение",
};
export const resolveType = (type: DB.LogType) => resolveTypeMap[type];
const resolveTargetMap: Record<DB.LogTarget, string> = {
  category: "Категория",
  categoryPhone: "СС категории",
  department: "Подразделение",
  holder: "Владелец",
  holding: "Движение",
  holdingPhone: "СС движения",
  model: "Модель СС",
  phone: "Средство связи",
  phoneType: "Тип средства связи",
  placement: "Местоположение",
  user: "Пользователь",
};
const resolveTarget = (target: DB.LogTarget) => resolveTargetMap[target];

const resolveTargetHref = (target: DB.LogTarget, id: number) => {
  switch (target) {
    case "phone":
      return `/phone/view?selectedId=${id}`;
    case "category":
      return `/category/view?id=${id}`;
    case "holding":
      return `/holding/view?id=${id}`;
    case "user":
      return `/admin/users?id=${id}`;
    case "department":
      return `/admin/departments?id=${id}`;
    case "holder":
      return `/admin/holder?id=${id}`;
    case "placement":
      return `/admin/placements?id=${id}`;
    default:
      return "#";
  }
};

const Logs: React.FC<LogsProps> = (props) => {
  const [offset, setOffset] = React.useState(0);
  const { logs, getUser } = useContainer(offset);

  const { currentPage, maxPage } = usePaginator(
    offset,
    setOffset,
    logs.data.total,
    pageItems
  );

  const tableColumns: TableColumn<DB.LogAttributes>[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      required: true,
      mapper: (v, item) => (
        <ActionBox
          showDetails={() => detailsPopup.onToggle(true, item.payload ?? {})}
        />
      ),
    },
    // {
    //   key: "id",
    //   header: "ID",П
    //   size: "30px",
    // },
    {
      key: "target",
      header: "Цель",
      mapper: (v, item) => resolveTarget(item.target),
    },
    {
      key: "type",
      header: "Тип действия",
      mapper: (v, item) => resolveType(item.type),
      // size: "150px",
    },
    {
      wrap: true,
      key: "targets",
      header: "Затрагиваемое",
      mapper: (v: { id: number }[], item) =>
        v.map((v, i, arr) => (
          <>
            <Link inline key={v.id} href={resolveTargetHref(item.target, v.id)}>
              #{v.id}
            </Link>
            {i === arr.length - 1 ? "" : ", "}
          </>
        )),
      // size: "150px",
    },
    {
      key: "createdAt",
      header: "Время",
      type: "date",
      // size: "150px",
    },
    columns.author({ getUser }),
  ];

  const [bind] = useInput({});

  const tableItems = logs.data.items.map((log) => log);

  const { state: payload, ...detailsPopup } = useTogglePayloadPopup();

  // const noticeContext = React.useContext(NoticeContext);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <PopupLayer>
        <DetailsPopup {...detailsPopup} payload={payload} />
      </PopupLayer>
      <TopBarLayer>
        {/* <Layout flex="1"> */}
          <Paginator
            style={{ marginRight: "auto" }}
            current={currentPage}
            max={maxPage}
            min={1}
            size={5}
            onChange={(page) => setOffset((page - 1) * pageItems)}
          />
          <Header align="right">История операций ({logs.data.total})</Header>
        {/* </Layout> */}
      </TopBarLayer>
      <Layout>
        {/* <Form
          input={bind.input}
          onSubmit={(data) => {
            // onSubmit(data);
            // createPhoneModel(data as any);
            // noticeContext.createNotice("Пользователь создан");
          }}
        >
          <Layout flow="row">
            <Input
              required
              label="Наименование"
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Button
              style={{
                marginTop: "auto",
                marginLeft: "auto",
                padding: "0 4rem",
              }}
              margin="md"
              type="submit"
              color="primary"
            >
              Создать
            </Button>
          </Layout>
        </Form> */}
        {/* <Hr /> */}

        <Table stickyTop={45} items={tableItems} columns={tableColumns} />
      </Layout>
    </>
  );
};

const ActionBox = (props: { showDetails: () => void }) => {
  // const { commit } = props;
  const [target, setTarget] = React.useState<HTMLElement | null>(() => null);

  const [isOpen, setIsOpen] = React.useState(() => false);

  return (
    <Button
      ref={(r) => setTarget(r)}
      color="primary"
      inverted
      onClick={() => setIsOpen(true)}
    >
      <Icon.Box />
      <SpoilerPopup
        target={isOpen ? target : null}
        position="right"
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as any))
            e.preventDefault();
          else setIsOpen(false);
        }}
      >
        <SpoilerPopupButton onClick={() => props.showDetails()}>
          Подробности
        </SpoilerPopupButton>
      </SpoilerPopup>
    </Button>
  );
};

export default Logs;
