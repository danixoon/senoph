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
import { getDepartmentName, useDepartment } from "hooks/misc/department";
import { splitHolderName, useHolder } from "hooks/misc/holder";

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
import InfoBanner from "components/InfoBanner";
import { getLastHolding } from "hooks/misc/holding";

export type CategoryPageProps = {
  phones: Api.Models.Phone[];
  categories: Api.Models.PhoneCategory[];
  categoriesPhones: Map<number, Api.Models.Phone>;
  categoryCreationStatus: ApiStatus;
  phonesStatus: ApiStatus;
  categoriesStatus: ApiStatus;

  onSubmitCategory: (data: any) => void;
};

const CreateContent: React.FC<CategoryPageProps> = (props) => {
  const { phones, categoryCreationStatus, onSubmitCategory: onSubmit } = props;
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
  const getHolder = useHolder();
  const getDepartment = useDepartment();

  const [bind] = useInput({});

  const [bindFile] = useFileInput();

  const tableItems = phones.map((phone) => {
    const lastHolding = getLastHolding(phone.holdings);
    return {
      ...phone,
      modelName: phone.model?.name,
      holderName: splitHolderName(getHolder(lastHolding?.holderId)),
      departmentName: getDepartmentName(
        getDepartment(lastHolding?.departmentId)
      ),
    };
  });

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
            // noticeContext.createNotice("Категория создана");
          }}
        >
          <Layout flow="row">
            <Dropdown
              required
              style={{ flex: "1" }}
              label="Категория"
              name="categoryKey"
              items={[
                { id: "1", label: "I (Прибыло, на гарантии)" },
                { id: "2", label: "II (Нет гарантии, исправно)" },
                { id: "3", label: "III (Неисправно)" },
                { id: "4", label: "IV (Подлежит списанию)" },
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
              disabled={categoryCreationStatus.isLoading}
            >
              {categoryCreationStatus.isLoading ? <LoaderIcon /> : "Создать"}
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
  const getDepartment = useDepartment();

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
    const phone = props.categoriesPhones.get(category.phoneId);
    return {
      ...category,
      departmentName: getDepartmentName(
        getDepartment(getLastHolding(phone?.holdings)?.departmentId)
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
  const { phones, categories } = props;

  const { path } = useRouteMatch();

  return (
    <Layout flex="1" className="holding-page">
      <Switch>
        <Route path={`${path}/create`}>
          {phones.length === 0 ? (
            <InfoBanner
              text="Для смены категории выберите"
              hrefContent="средство связи"
              href="/phone/edit"
            />
          ) : (
            <CreateContent {...props} />
          )}
        </Route>
        <Route path={`${path}/view`}>
          {categories.length === 0 ? (
            <InfoBanner
              text="Категории для подтверждения отсутствуют. Добавьте их, выбрав"
              hrefContent="средство связи"
              href="/phone/edit"
            />
          ) : (
            <ViewContent {...props} />
          )}
        </Route>
      </Switch>
    </Layout>
  );
};

export default CategoryPage;
