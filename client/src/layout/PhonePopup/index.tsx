import Badge from "components/Badge";
import Dropdown from "components/Dropdown";
import Header from "components/Header";
import Hr from "components/Hr";
import Input from "components/Input";
import Label, { LabelProps } from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import LinkItem from "components/LinkItem";
import ListItem from "components/ListItem";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import Span from "components/Span";
import Spoiler from "components/Spoiler";
import Switch from "components/Switch";
import Toggle from "components/Toggle";
import LinkItemContainer from "containers/LinkItem";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { useInput } from "hooks/useInput";
import * as React from "react";
import { Edit, Edit2, Edit3 } from "react-feather";
import { BeforeFindAfterOptions } from "sequelize-typescript";

import "./style.styl";

export type PhonePopupProps = {
  phone: ApiResponse.Phone | null;
} & PopupProps;

const HoldingItem: React.FC<{
  prevHolder: string;
  nextHolder: string;
  actKey: string;
  actDate: Date;
}> = (props) => {
  return (
    <Layout className="holding-item">
      <ListItem label="От">
        <Link>{props.prevHolder}</Link>
      </ListItem>
      <ListItem label="Кому">
        <Link>{props.nextHolder}</Link>
      </ListItem>
      <ListItem label="Акт">
        <Link size="sm">№{props.actKey}</Link>
        <Label weight="bold" style={{ margin: "0 0.5rem" }}>
          от
        </Label>
        <Link>{props.actDate.toLocaleDateString()}</Link>
      </ListItem>
    </Layout>
  );
};

const CategoryItem: React.FC<{
  category: number;
  actKey: string;
  actDate: Date;
}> = (props) => {
  const { category, actKey, actDate } = props;
  let cat = "?";
  switch (category) {
    case 1:
      cat = "I";
      break;
    case 2:
      cat = "II";
      break;
    case 3:
      cat = "III";
      break;
    case 4:
      cat = "IV";
      break;
  }

  const labelStyle = { style: { margin: "0 0.25rem" }, weight: "bold" } as Pick<
    LabelProps,
    "style" | "weight"
  >;

  return (
    <Layout flow="row" className="category-item">
      <Badge onClick={() => {}} className="category-item__level">
        {cat}
      </Badge>
      <Label {...labelStyle}>Акт </Label>
      <Link> №{actKey}</Link>
      <Label {...labelStyle}>от</Label>
      <Link>{actDate.toLocaleDateString()}</Link>
    </Layout>
  );
};

const Content: React.FC<{ phone: NonNullable<PhonePopupProps["phone"]> }> = (
  props
) => {
  const { phone } = props;
  const { types, departments } = useFilterConfig();

  const [bind] = useInput({ search: "", tab: "category" });

  const typeName = types.find((t) => phone.model?.phoneTypeId === t.id)?.name;
  const modelName = phone.model?.name;
  const departmentName = departments.find(
    (d) => phone.holder?.departmentId == d.id
  )?.name;
  const holderName = `${phone?.holder?.lastName} ${phone?.holder?.firstName} ${phone?.holder?.middleName}`;

  const {
    factoryKey,
    inventoryKey,
    accountingDate,
    commissioningDate,
    assemblyDate,
  } = phone;

  const renderCategories = () =>
    (phone.categories?.length ?? 0) > 0 ? (
      phone.categories?.map((cat) => (
        <CategoryItem
          key={cat.id}
          actDate={new Date(cat.date)}
          actKey="13"
          category={Number.parseInt(cat.category)}
        />
      ))
    ) : (
      <Header align="center">Категории отсутствуют.</Header>
    );

  const renderHoldings = () =>
    (phone.holdings?.length ?? 0) > 0 ? (
      phone.holdings?.map((hold) => (
        <HoldingItem
          key={hold.id}
          actDate={new Date(hold.actDate)}
          actKey={hold.actKey}
          nextHolder="Пупа Лупа Пупович"
          prevHolder="Попов Иван Анатольевич"
        />
      ))
    ) : (
      <Header align="center"> Движения отсутствуют.</Header>
    );

  return (
    <Layout padding="md" flex="1">
      <PopupTopBar>
        <Header hr align="center" style={{ flex: 1 }}>
          {/* <Edit3 color="#C5C5C5" /> */}
          Средство связи №{phone.id} ({phone.model?.name})
        </Header>
        <Switch
          {...bind}
          size="sm"
          border
          // position="vertical"
          name="tab"
          items={[
            {
              id: "category",
              name: `Категории (${phone.categories?.length ?? 0})`,
            },
            {
              id: "holding",
              name: `Движения (${phone.holdings?.length ?? 0})`,
            },
          ]}
        />
      </PopupTopBar>
      <Layout flow="row" flex="1">
        <Layout flex="1">
          <ListItem label="Тип">
            <Span>{typeName}</Span>
          </ListItem>
          <ListItem label="Модель">
            <Span
              altLabel={{
                text: "Модель устройства!",
                zIndex: "popup",
                position: "right",
              }}
            >
              {modelName}
            </Span>
          </ListItem>
          <ListItem label="Заводской номер">
            <Span> {factoryKey}</Span>
          </ListItem>
          <ListItem label="Инвентарный номер">
            <Span>{inventoryKey}</Span>
          </ListItem>
          <Hr />
          <ListItem label="Дата принятия к учёту">
            <Span font="monospace">
              {new Date(accountingDate).toLocaleDateString()}
            </Span>
          </ListItem>
          <ListItem label="Дата ввода в эксплуатацию">
            <Span>{new Date(commissioningDate).toLocaleDateString()}</Span>
          </ListItem>
          <Hr />
          <ListItem label="Подразделение">
            <Span>{departmentName}</Span>
          </ListItem>
          <ListItem label="Материально-ответственное лицо">
            <Link
              href="/phone/edit"
              altLabel={{ text: "Точно хочешь узнать?", zIndex: "popup" }}
              isMonospace
            >
              {holderName}
            </Link>
          </ListItem>
          <Hr />
        </Layout>
        <Hr vertical />
        <Layout flex="0 0 250px" padding="md">
          <Input
            {...bind}
            name="search"
            inputProps={{ placeholder: "Фильтр.." }}
          />
          {bind.input.tab === "category"
            ? renderCategories()
            : renderHoldings()}
        </Layout>
      </Layout>

      {/* <Dropdown
        {...bind}
        items={types.map((type) => ({
          label: type.name,
          id: type.id,
          payload: type,
        }))}
        label="Тип"
        name="phoneTypeId"
        disabled
      /> */}
      {/* </Layout> */}
      {/* <Layout flow="row"> */}
      {/* </Layout> */}
    </Layout>
  );
};

const PhonePopup: React.FC<PhonePopupProps> = (props) => {
  const { phone, ...rest } = props;
  return (
    <Popup {...rest} size="lg" closeable noPadding>
      {phone && <Content phone={phone} />}
    </Popup>
  );
};

export default PhonePopup;
