import Badge from "components/Badge";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon from "components/Icon";
import Input from "components/Input";
import Label, { LabelProps } from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import ListItem, { ListItemProps } from "components/ListItem";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import Span from "components/Span";
import Switch from "components/Switch";
import { useChanges } from "hooks/api/useChanges";
import { useFilterConfig } from "hooks/api/useFetchConfig";
import { useMakeChanges } from "hooks/api/useMakeChanges";
import { useUndoChanges } from "hooks/api/useUndoChanges";
import { useInput } from "hooks/useInput";
import FieldEditPopup from "layout/FieldEditPopup";
import PhoneEditActions from "layout/PhoneEditActions";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import { mergeClassNames } from "utils";

import "./style.styl";

export type PhonePopupProps = {
  phone: Api.Models.Phone | null;
  isEditMode: boolean;
  changeEditMode: (mode: boolean) => void;
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

const EditableListItem: React.FC<
  OverrideProps<
    ListItemProps,
    {
      targetId: number;
      changes: any;
      propertyKey: string;
      target: ChangesTargetName;
      onOpen: (
        target: ChangesTargetName,
        targetId: number,
        key: string
      ) => void;
      editable?: boolean;
    }
  >
> = (props) => {
  const {
    onOpen,
    changes,
    target,
    targetId,
    propertyKey: key,
    editable,
    children,
    ...rest
  } = props;
  const isEdited = (changes[targetId] ?? {})[key] !== undefined;

  const Container: React.FC<{}> = ({ children }) =>
    editable ? <Button inverted>{children}</Button> : <> {children} </>;

  const content = isEdited ? changes[targetId][key] : children;

  return (
    <ListItem {...rest}>
      <Layout
        flow="row"
        style={{ alignItems: "center" }}
        onClick={editable ? () => onOpen(target, targetId, key) : undefined}
      >
        <Container>
          <Span
            className={mergeClassNames(
              "edit-item",
              editable && "edit-item_editable"
            )}
          >
            {content}
          </Span>
        </Container>
        {isEdited && (
          <Icon.Edit2
            color="bgDark"
            size="xs"
            style={{ marginLeft: "0.5rem" }}
            altLabel={{ text: "Изменён", position: "right", zIndex: "popup" }}
          />
        )}
      </Layout>
    </ListItem>
  );
};

const Content: React.FC<
  Omit<PhonePopupProps, "phone"> & {
    phone: NonNullable<PhonePopupProps["phone"]>;
  }
> = (props) => {
  const { phone, isEditMode: edit, changeEditMode } = props;
  const { types, departments } = useFilterConfig();

  const [bind] = useInput({ search: "", tab: "category" });

  const typeName = types.find((t) => phone.model?.phoneTypeId === t.id)?.name;
  const modelName = phone.model?.name;
  const departmentName = departments.find(
    (d) => phone.holder?.departmentId == d.id
  )?.name;
  const holderName = `${phone?.holder?.lastName} ${phone?.holder?.firstName} ${phone?.holder?.middleName}`;

  const {
    // factoryKey,
    // inventoryKey,
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

  const [field, setFieldEdit] = React.useState<{
    isEdit: boolean;
    type: "text";
    key: string;
    label: null | string;
    target: ChangesTargetName;
    targetId: number;
  }>(() => ({
    isEdit: false,
    type: "text",
    key: "no_key",
    label: null,
    target: "Phone",
    targetId: -1,
  }));

  const handleFieldEdit = (change: {
    type: "text";
    key: string;
    label?: string;
    targetId: number;
    target: ChangesTargetName;
  }) => {
    setFieldEdit({
      type: change.type,
      isEdit: true,
      label: change.label ?? field.label,
      key: change.key,
      target: change.target,
      targetId: change.targetId,
    });
  };
  const [makeChanges] = useMakeChanges();
  const [undoChanges] = useUndoChanges();

  const [changes] = useChanges("Phone");

  // TODO: Контекст формы для Input-объектов

  const changedValue = (changes[field.targetId] ?? {})[field.key];
  // const isChanged = (changes[field.targetId] ?? {})[key] !== undefined;

  return (
    <>
      <PopupLayer>
        <FieldEditPopup
          onSubmit={(value) => {
            makeChanges({
              target: field.target,
              targetId: field.targetId,
              changes: { [field.key]: value },
            });
          }}
          onReset={() => {
            undoChanges({
              target: field.target,
              targetId: field.targetId,
              keys: [field.key],
            });
          }}
          defaultValue={changedValue}
          name={field.key || "field"}
          isOpen={field.isEdit}
          type={field.type}
          label={field.label ?? undefined}
          onToggle={() =>
            setFieldEdit({
              ...field,
              isEdit: false,
            })
          }
        />
      </PopupLayer>
      <Layout padding="md" flex="1">
        <PopupTopBar>
          <Header hr align="center" style={{ flex: 1, display: "flex" }}>
            <ButtonGroup>
              <Button
                margin="none"
                color="primary"
                size="xs"
                onClick={() => changeEditMode(!edit)}
              >
                {edit ? <Icon.Eye /> : <Icon.Edit3 />}
              </Button>
              <Badge
                margin="none"
                isWarn={edit}
                color={edit ? "primary" : "secondary"}
              >
                {edit ? "Изменение" : "Просмотр"}
              </Badge>
            </ButtonGroup>
            {/* <Edit3 color="#C5C5C5" /> */}
            <span style={{ margin: "auto" }}>
              Средство связи №{phone.id} ({phone.model?.name})
            </span>
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
            <EditableListItem
              label="Заводской номер"
              onOpen={(target, targetId, key) =>
                handleFieldEdit({
                  type: "text",
                  label: "Новый заводской номер",
                  key,
                  target,
                  targetId,
                })
              }
              changes={changes}
              target="Phone"
              targetId={phone.id}
              propertyKey="factoryKey"
              editable={edit}
            >
              {phone.factoryKey}
            </EditableListItem>
            <EditableListItem
              label="Инвентарный номер"
              onOpen={(target, targetId, key) =>
                handleFieldEdit({
                  type: "text",
                  label: "Новый инвентарный номер",
                  key,
                  target,
                  targetId,
                })
              }
              changes={changes}
              target="Phone"
              targetId={phone.id}
              propertyKey="inventoryKey"
              editable={edit}
            >
              {phone.inventoryKey}
            </EditableListItem>
            <Hr />
            <EditableListItem
              label="Дата ввода в эксплуатацию"
              onOpen={(target, targetId, key) =>
                handleFieldEdit({
                  type: "text",
                  label: "Новая дата ввода в эксплуатацию",
                  key,
                  target,
                  targetId,
                })
              }
              changes={changes}
              target="Phone"
              targetId={phone.id}
              propertyKey="assemblyDate"
              editable={edit}
            >
              {new Date(assemblyDate).toLocaleDateString()}
            </EditableListItem>
            <Hr />
            <EditableListItem
              label="Дата принятия к учёту"
              onOpen={(target, targetId, key) =>
                handleFieldEdit({
                  type: "text",
                  label: "Новая дата принятия к учёту",
                  key,
                  target,
                  targetId,
                })
              }
              changes={changes}
              target="Phone"
              targetId={phone.id}
              propertyKey="accountingDate"
              editable={edit}
            >
              {new Date(accountingDate).toLocaleDateString()}
            </EditableListItem>
            <EditableListItem
              label="Дата ввода в эксплуатацию"
              onOpen={(target, targetId, key) =>
                handleFieldEdit({
                  type: "text",
                  label: "Новая дата ввода в эксплуатацию",
                  key,
                  target,
                  targetId,
                })
              }
              changes={changes}
              target="Phone"
              targetId={phone.id}
              propertyKey="commissioningDate"
              editable={edit}
            >
              {new Date(commissioningDate).toLocaleDateString()}
            </EditableListItem>
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
          <PhoneEditActions>
            <Button color="primary" style={{ marginTop: "auto" }}>
              Удалить
            </Button>
          </PhoneEditActions>
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
    </>
  );
};

const PhonePopup: React.FC<PhonePopupProps> = (props) => {
  const { phone, isEditMode, changeEditMode, ...rest } = props;
  return (
    <Popup {...rest} size="lg" closeable noPadding>
      {phone && (
        <Content
          phone={phone}
          isEditMode={isEditMode}
          changeEditMode={changeEditMode}
          {...rest}
        />
      )}
    </Popup>
  );
};

export default PhonePopup;
