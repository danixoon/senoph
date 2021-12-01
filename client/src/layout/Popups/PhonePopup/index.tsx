import Badge from "components/Badge";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Label, { LabelProps } from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import ListItem, { ListItemProps } from "components/ListItem";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import Span from "components/Span";
import Switch from "components/Switch";
import WithLoader from "components/WithLoader";
import { ChangeStatus, useChanges } from "hooks/api/useChanges";
import { useFetchConfig } from "hooks/api/useFetchConfig";
import { useMakeChanges } from "hooks/api/useMakeChanges";
import { useUndoChanges } from "hooks/api/useUndoChanges";
import { useInput } from "hooks/useInput";
import FieldEditPopup, {
  FieldEditPopupType,
} from "layout/Popups/FieldEditPopup";
import PhoneEditActions from "layout/PhoneEditActions";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import { mergeClassNames } from "utils";
import CategoryItem from "./CategoryItem";
import EditableListItem from "./EditableListItem";
import HoldingItem from "./HoldingItem";

import "./style.styl";
import { useFetchHolder, useLastHolder } from "hooks/api/useFetchHolder";
import { splitHolderName, useHolder } from "hooks/misc/holder";
import { getLastHolding } from "hooks/misc/holding";
import { getDepartmentName, useDepartment } from "hooks/misc/department";
import { usePhoneType } from "hooks/misc/phoneType";

export type PhonePopupProps = {
  phone: Api.Models.Phone | null;
  isEditMode: boolean;
  changeEditMode: (mode: boolean) => void;
  makeChanges: (targetId: number, changes: any) => void;
  undoChanges: (targetId: number, keys: string[]) => void;
  onDelete: () => void;
  onDeleteCategory: (id: any) => void;
  onSelectHolding: (id: any) => void;
  changes: any[];
  popupProps?: PopupProps;
  fetchPhoneStatus: ApiStatus;
  deletePhoneStatus: ApiStatus;
};

const Content: React.FC<
  Omit<PhonePopupProps, "phone"> & {
    phone: NonNullable<PhonePopupProps["phone"]>;
  }
> = (props) => {
  const {
    phone,
    changes,
    isEditMode: edit,
    changeEditMode,
    onDeleteCategory,
    deletePhoneStatus,
    onSelectHolding,
    makeChanges,
    undoChanges,
    onDelete,
  } = props;

  const getHolder = useHolder();
  const getDepartment = useDepartment();
  const getType = usePhoneType();

  const [bind] = useInput({ tab: "category" });

  const typeName = getType(phone.model?.phoneTypeId);
  const modelName = phone.model?.name;

  const lastHolding = getLastHolding(phone.holdings);

  const holder = getHolder(lastHolding?.holderId);
  const departmentName = getDepartmentName(
    getDepartment(lastHolding?.departmentId)
  );

  const { accountingDate, commissioningDate, assemblyDate } = phone;

  const renderCategories = () =>
    (phone.categories?.length ?? 0) > 0 ? (
      phone.categories?.map((cat) => (
        <CategoryItem
          onDelete={() => onDeleteCategory(cat.id)}
          key={cat.id}
          deletable={edit}
          actDate={new Date(cat.actDate)}
          category={Number.parseInt(cat.categoryKey)}
        />
      ))
    ) : (
      <Header align="center">Категории отсутствуют.</Header>
    );

  const renderHoldings = () =>
    (phone.holdings?.length ?? 0) > 0 ? (
      phone.holdings?.map((hold) => (
        <HoldingItem
          departmentId={hold.departmentId}
          holderId={hold.holderId}
          orderUrl={hold.orderUrl}
          department={getDepartmentName(getDepartment(hold.departmentId))}
          onSelect={() => onSelectHolding(hold.id)}
          key={hold.id}
          orderDate={new Date(hold.orderDate ?? Date.now())}
          orderKey={hold.orderKey}
          holder={splitHolderName(hold.holder)}
        />
      ))
    ) : (
      <Header align="center"> Движения отсутствуют.</Header>
    );

  const [field, setFieldEdit] = React.useState<{
    isEdit: boolean;
    type: FieldEditPopupType;
    key: string;
    label: null | string;
    targetId: number;
  }>(() => ({
    isEdit: false,
    type: "text",
    key: "no_key",
    label: null,
    targetId: -1,
  }));

  const handleFieldEdit =
    (label = field.label, type: FieldEditPopupType = "text" as const) =>
    (targetId: number, key: string) =>
      setFieldEdit({
        type,
        isEdit: true,
        label,
        key,
        targetId,
      });

  // TODO: Контекст формы для Input-объектов

  const changedValue = (changes.find(
    (c) => c.id.toString() === field.targetId.toString()
  ) ?? {})[field.key];

  return (
    <>
      <PopupLayer>
        <FieldEditPopup
          onSubmit={(value) =>
            makeChanges(field.targetId, { [field.key]: value })
          }
          onReset={() => undoChanges(field.targetId, [field.key])}
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
            <span style={{ margin: "auto" }}>
              Средство связи #{phone.id} ({phone.model?.name})
              {phone.status === "create-pending" ? (
                <Link href={`/phone/commit/actions?id=${phone.id}`}>
                  <Span
                    style={{ marginLeft: "1rem" }}
                    inline
                    color="primary"
                    weight="bold"
                  >
                    ПОДЛЕЖИТ СОЗДАНИЮ
                  </Span>
                </Link>
              ) : phone.status === "delete-pending" ? (
                <Link href={`/phone/commit/actions?id=${phone.id}`}>
                  <Span
                    style={{ marginLeft: "1rem" }}
                    inline
                    color="primary"
                    weight="bold"
                  >
                    ПОДЛЕЖИТ УДАЛЕНИЮ
                  </Span>
                </Link>
              ) : (
                ""
              )}
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
              <Span>{modelName}</Span>
            </ListItem>
            <EditableListItem
              label="Заводской номер"
              onOpen={handleFieldEdit("Новый заводской номер")}
              propertyKey="factoryKey"
              editable={edit}
            >
              {phone.factoryKey}
            </EditableListItem>
            <EditableListItem
              label="Инвентарный номер"
              onOpen={handleFieldEdit("Новый инвентарный номер")}
              propertyKey="inventoryKey"
              editable={edit}
            >
              {phone.inventoryKey}
            </EditableListItem>
            <Hr />
            <EditableListItem
              label="Год сборки"
              onOpen={handleFieldEdit("Новый год сборки", "number")}
              propertyKey="assemblyDate"
              editable={edit}
              mapper={(v) => new Date(v).getFullYear()}
            >
              {assemblyDate}
            </EditableListItem>
            <Hr />
            <EditableListItem
              label="Дата принятия к учёту"
              onOpen={handleFieldEdit("Новая дата принятия к учёту", "date")}
              propertyKey="accountingDate"
              editable={edit}
              mapper={(v) => new Date(v).toLocaleDateString()}
            >
              {accountingDate}
            </EditableListItem>
            <EditableListItem
              label="Дата ввода в эксплуатацию"
              onOpen={handleFieldEdit(
                "Новая дата ввода в эксплуатацию",
                "date"
              )}
              propertyKey="commissioningDate"
              editable={edit}
              mapper={(v) => new Date(v).toLocaleDateString()}
            >
              {commissioningDate}
            </EditableListItem>
            <Hr />
            {holder ? (
              <>
                <ListItem label="Подразделение">
                  <Span>{departmentName}</Span>
                </ListItem>
                <ListItem label="Материально-ответственное лицо">
                  <Link href="/phone/edit" isMonospace>
                    {splitHolderName(holder)}
                  </Link>
                </ListItem>
              </>
            ) : (
              <Header align="center">
                Материально-ответственное лицо отсутствует. Создайте его с
                помощью движения
              </Header>
            )}
            <Hr />
          </Layout>
          {edit ? (
            <>
              <Hr vertical />
              <PhoneEditActions phoneIds={[phone.id]}>
                <Button
                  color="primary"
                  style={{ marginTop: "auto" }}
                  onClick={onDelete}
                  disabled={deletePhoneStatus.isLoading}
                >
                  {deletePhoneStatus.isLoading ? <LoaderIcon /> : "Удалить"}
                </Button>
              </PhoneEditActions>
            </>
          ) : (
            ""
          )}
          <Hr vertical />
          <Layout flex="0 0 250px" padding="md">
            {bind.input.tab === "category"
              ? renderCategories()
              : renderHoldings()}
          </Layout>
        </Layout>
      </Layout>
    </>
  );
};

const PhonePopup: React.FC<PhonePopupProps> = (props) => {
  const {
    phone,
    popupProps = {},
    fetchPhoneStatus: phoneStatus,
    ...rest
  } = props;

  return (
    <Popup {...popupProps} size="lg" closeable noPadding>
      <WithLoader isLoading={phoneStatus.isLoading}>
        <Content
          phone={phone as Api.Models.Phone}
          {...rest}
          fetchPhoneStatus={phoneStatus}
        />
      </WithLoader>
    </Popup>
  );
};

export default PhonePopup;
