import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import Link from "components/Link";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import { useInput } from "hooks/useInput";
import React from "react";
import { api } from "store/slices/api";

export type LogsProps = {};

const useContainer = () => {
  const logs = api.useFetchLogsQuery({});

  return {
    logs: { ...logs, items: logs.data?.items ?? [] },
  };
};

const Logs: React.FC<LogsProps> = (props) => {
  const { logs } = useContainer();

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      required: true,
      mapper: (v, item) => <ActionBox showDetails={() => {}} />,
    },
    // {
    //   key: "id",
    //   header: "ID",
    //   size: "30px",
    // },
    {
      key: "target",
      header: "Цель",
      // size: "150px",
    },
    {
      key: "type",
      header: "Тип действия",
      // mapper: () => ()
      // size: "150px",
    },
    {
      key: "targets",
      header: "Затрагиваемое",
      mapper: (v: { id: number }[]) =>
        v.map((v) => (
          <Link key={v.id} href="#">
            #{v.id}
          </Link>
        )),
      // size: "150px",
    },
    {
      key: "authorId",
      header: "Автор",
      // size: "150px",
    },
    {
      key: "createdAt",
      header: "Время",
      type: "date",
      // size: "150px",
    },
  ];

  const [bind] = useInput({});

  const tableItems = logs.items.map((log) => log);

  // const noticeContext = React.useContext(NoticeContext);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
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
        {/* <Header align="right">История операций ({logs.items.length})</Header> */}
        <Table items={tableItems} columns={columns} />
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
