import ReactJson from "react-json-view";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
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
import Toggle from "components/Toggle";
import { getLocalDate } from "utils";

import "./style.styl";
import Badge from "components/Badge";
import WithLoader from "components/WithLoader";

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

const pageItems = 15;

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

  const [bind] = useInput({ systemMode: false });

  const tableItems = logs.data.items.map((log) => log);

  const { state: payload, ...detailsPopup } = useTogglePayloadPopup();

  // const noticeContext = React.useContext(NoticeContext);

  const isSystem = bind.input.systemMode;

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <PopupLayer>
        <DetailsPopup {...detailsPopup} payload={payload} />
      </PopupLayer>
      <TopBarLayer>
        <Layout
          style={{ height: "24px", alignItems: "center" }}
          flow="row"
          flex="1"
        >
          <Toggle {...bind} name="systemMode" label="Системный лог" />
          {!isSystem && (
            <Layout
              style={{ marginLeft: "auto", alignItems: "center" }}
              flow="row"
            >
              <Paginator
                current={currentPage}
                max={maxPage}
                min={1}
                size={10}
                onChange={(page) => setOffset((page - 1) * pageItems)}
              />

              <Header align="right">
                История операций ({logs.data.total})
              </Header>
            </Layout>
          )}
        </Layout>
      </TopBarLayer>
      <Layout>
        {isSystem ? (
          <SystemLogs />
        ) : (
          <Table stickyTop={45} items={tableItems} columns={tableColumns} />
        )}
      </Layout>
    </>
  );
};

type SystemLog = {
  level: string;
  message: string;
  timestamp: string;
  service: string;
  payload: any;
};
const SystemLogItem: React.FC<{ item: SystemLog }> = (props) => {
  const { item } = props;

  const [opened, setOpened] = React.useState(false);
  const crop = item.message.length > 200;

  return (
    <>
      <Layout flex="1" className="log-item">
        <Layout flow="row" flex="1" className="log-item__info">
          <Span font="monospace" weight="bold" className="log-info__level">
            {item.level}
          </Span>
          <Span className="log-info__message">
            {crop && !opened ? item.message.slice(0, 200) : item.message}
            {crop && (
              <>
                {" "}
                <Link inline onClick={() => setOpened(!opened)}>
                  {opened ? "меньше подробностей" : "подробнее"}
                </Link>
              </>
            )}
          </Span>

          <Badge className="log-info__service">{item.service}</Badge>
          <Header className="log-info__time">
            {getLocalDate(item.timestamp)}
          </Header>
        </Layout>
        {item.payload && (
          <ReactJson
            style={{ maxWidth: "70vw" }}
            displayDataTypes={false}
            name={null}
            collapseStringsAfterLength={200}
            displayObjectSize={false}
            src={item.payload ?? {}}
          />
        )}
      </Layout>
    </>
  );
};
const SystemLogs: React.FC<{}> = (props) => {
  const [offset, setOffset] = React.useState(0);
  const [amount, setAmount] = React.useState(15);
  const fetchLogs = api.useFetchSystemLogsQuery({
    offset,
    amount: 1024 * amount,
  });
  const logs = parseItems(fetchLogs);

  return (
    <Layout flex="1" className="system-logs">
      <TopBarLayer>
        {logs.status.isLoading && <LoaderIcon />}
        <Button onClick={() => fetchLogs.refetch()} color="primary">
          Обновить
        </Button>
        <Input
          blurrable
          placeholder="КБ"
          type="number"
          input={{ size: amount }}
          name="size"
          onChange={(e) => {
            let value = parseInt(e.target.value);
            if (isNaN(value)) value = 1;
            if (value > 512) value = 512;
            if (value < 1) value = 1;
            setAmount(value);
          }}
        />
      </TopBarLayer>
      <WithLoader status={logs.status}>
        {logs.data.items.map((log) => (
          <SystemLogItem key={log.timestamp} item={log} />
        ))}
      </WithLoader>
    </Layout>
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
