import Badge from "components/Badge";
import Dropdown from "components/Dropdown";
import Header from "components/Header";
import Input from "components/Input";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import LinkItem from "components/LinkItem";
import ListItem from "components/ListItem";
import Popup, { PopupProps } from "components/Popup";
import Spoiler from "components/Spoiler";
import Toggle from "components/Toggle";
import LinkItemContainer from "containers/LinkItem";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { useInput } from "hooks/useInput";
import * as React from "react";

import "./style.styl";

export type PhonePopupProps = {
  phone: ApiResponse.Phone | null;
} & PopupProps;

const Content: React.FC<{ phone: NonNullable<PhonePopupProps["phone"]> }> = (
  props
) => {
  const { phone } = props;
  const { types, departments } = useFilterConfig();

  const [bind] = useInput({ phoneTypeId: phone.model?.phoneTypeId });

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

  return (
    <Layout>
      <Header>СС №{phone.id}</Header>
      <Layout>
        <ListItem label="Тип">
          <Badge>{typeName}</Badge>
        </ListItem>
        <ListItem label="Модель">
          <Badge>{modelName}</Badge>
        </ListItem>
        <ListItem label="Заводской номер">
          <Badge>{factoryKey}</Badge>
        </ListItem>
        <ListItem label="Инвентарный номер">
          <Badge>{inventoryKey}</Badge>
        </ListItem>
        <ListItem label="Дата принятия к учёту">
          <Badge>{new Date(accountingDate).toLocaleDateString()}</Badge>
        </ListItem>
        <ListItem label="Дата ввода в эксплуатацию">
          <Badge>{new Date(commissioningDate).toLocaleDateString()}</Badge>
        </ListItem>
        <ListItem label="Подразделение">
          <Badge>{departmentName}</Badge>
        </ListItem>
        <ListItem label="Материально-ответственное лицо">
          <Badge>{holderName}</Badge>
        </ListItem>
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
    </Layout>
  );
};

const PhonePopup: React.FC<PhonePopupProps> = (props) => {
  const { phone, ...rest } = props;
  return (
    <Popup {...rest} size="lg">
      {phone && <Content phone={phone} />}
    </Popup>
  );
};

export default PhonePopup;
