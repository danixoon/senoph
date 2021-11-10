import AltPopup from "components/AltPopup";
import Button from "components/Button";
import ClickInput from "components/ClickInput";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";
import Table, { TableColumn } from "components/Table";
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import DepartmentSelectionPopupContainer from "containers/DepartmentSelectionPopup";
import { useDepartmentName } from "hooks/misc/useDepartmentName";
import { useHolderName } from "hooks/misc/useHolderName";

import { useFileInput, useInput } from "hooks/useInput";
import { useQueryInput } from "hooks/useQueryInput";
import { useTimeout } from "hooks/useTimeout";
import PopupLayout from "layout/PopupLayout";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import { api } from "store/slices/api";

import "./style.styl";
import { useAppDispatch } from "store";
import { createNotice } from "store/slices/notice";
import { NoticeContext } from "providers/NoticeProvider";
import FileInput from "components/FileInput";
import { Route, Switch, useRouteMatch } from "react-router";
import { useLastHolder } from "hooks/api/useFetchHolder";
import Badge from "components/Badge";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";

export type CategoryPageProps = {
  phones: Api.Models.Phone[];
  categories: Api.Models.PhoneCategory[];
  categoriesPhones: Map<number, Api.Models.Phone>;
  phonesStatus: ApiStatus;
  categoriesStatus: ApiStatus;

  onSubmitCategory: (data: any) => void;
};

const CreateContent: React.FC<CategoryPageProps> = (props) => {
  const { phones, onSubmitCategory: onSubmit } = props;
  const columns: TableColumn[] = [
    {
      key: "id",
      header: "ID",
      size: "30px",
      mapper: (v, item) => (
        <Link href={`/phone/view?selectedId=${item.id}`}>
          <Span font="monospace">{`#${v}`}</Span>
        </Link>
      ),
    },
    { key: "modelName", header: "Модель", size: "150px" },
    { key: "inventoryKey", header: "Инвентарный номер", size: "300px" },
    { key: "holderName", header: "Владелец" },
    { key: "departmentName", header: "Отделение" },
  ];
  const getHolderName = useHolderName();
  const getDepartmentName = useDepartmentName();

  const [bind] = useInput({});

  const [bindFile] = useFileInput();

  const tableItems = phones.map((phone) => ({
    ...phone,
    modelName: phone.model?.name,
    holderName: getHolderName(phone.holder),
    departmentName: getDepartmentName(phone.holder?.departmentId),
  }));

  const noticeContext = React.useContext(NoticeContext);

  // TODO: Make proper typing for POST request params & form inputs
  return (
    <>
      <Layout>
        <Form
          json={false}
          input={{
            ...bind.input,
            ...bindFile.files,
            phoneIds: phones.map((phone) => phone.id),
          }}
          onSubmit={(data) => {
            onSubmit(data);
            noticeContext.createNotice("Категория создана");
          }}
        >
          <Layout flow="row">
            <Dropdown
              required
              style={{ flex: "1" }}
              label="Категория"
              name="categoryKey"
              items={[
                { id: "1", label: "I (Создание)" },
                { id: "2", label: "II (ТО)" },
                { id: "3", label: "III (Ремонт)" },
                { id: "4", label: "IV (Списано)" },
              ]}
              {...bind}
            />
            <Input
              required
              label="Дата акта"
              type="date"
              {...bind}
              name="actDate"
              style={{ flex: "1" }}
            />
            <Input
              required
              label="Файл акта"
              {...bindFile}
              name="actFile"
              style={{ flex: "1" }}
              type="file"
              inputProps={{ accept: ".pdf" }}
            />
          </Layout>
          <Layout flow="row">
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
        </Form>
        <Hr />
        <Header align="right">
          Затрагиваемые средства связи ({phones.length})
        </Header>
        <Table items={tableItems} columns={columns} />
      </Layout>
    </>
  );
};

const ActionBox = (props: { commit: (action: CommitActionType) => void }) => {
  const { commit } = props;
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
        <SpoilerPopupButton onClick={() => commit("approve")}>
          Подтвердить
        </SpoilerPopupButton>
        <SpoilerPopupButton onClick={() => commit("decline")}>
          Отменить
        </SpoilerPopupButton>
      </SpoilerPopup>
    </Button>
  );
};

const ViewContent: React.FC<CategoryPageProps> = (props) => {
  const [commitCategory, status] = api.useCommitCategoryMutation();
  const getDepartmentName = useDepartmentName();

  const columns: TableColumn[] = [
    {
      key: "control",
      size: "30px",
      header: "",
      mapper: (v, item: ArrayElement<typeof tableItems>) => (
        <ActionBox
          commit={(action) => {
            commitCategory({ ids: [item.phoneId], action });
          }}
        />
      ),
    },

    { key: "actDate", header: "Акт от", size: "100px", type: "date" },

    {
      key: "phoneId",
      header: "Средство связи",

      mapper: (v, item: ArrayElement<typeof tableItems>) => {
        return (
          <Link
            href={`/phone/view?selectedId=${item.phoneId}`}
          >{`#${item.phoneId}`}</Link>
        );
      },
    },
    {
      key: "departmentName",
      header: "Отделение",
    },
    {
      key: "categoryKey",
      header: "Категория",
      size: "150px",
      mapper: (v, item) => <Badge>{v}</Badge>,
    },
  ];

  const tableItems = props.categories.map((category) => {
    return {
      ...category,
      departmentName: getDepartmentName(
        props.categoriesPhones.get(category.phoneId)?.holder?.departmentId
      ),
    };
  });
  return (
    <>
      <Table columns={columns} items={tableItems} />
    </>
  );
};

const CategoryPage: React.FC<CategoryPageProps> = (props) => {
  const { phones } = props;

  const { path } = useRouteMatch();

  return (
    <Layout flex="1" className="holding-page">
      <Switch>
        <Route path={`${path}/create`}>
          {phones.length === 0 ? (
            <Label style={{ margin: "auto" }}>
              <Span>Для смены категории выберите</Span>
              <Link href="/phone/edit" style={{ marginLeft: "0.2rem" }}>
                средство связи
              </Link>
            </Label>
          ) : (
            <CreateContent {...props} />
          )}
        </Route>
        <Route path={`${path}/view`}>
          <ViewContent {...props} />
        </Route>
      </Switch>
    </Layout>
  );
};

export default CategoryPage;
