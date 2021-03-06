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
import { getPhoneTypeName, usePhoneType } from "hooks/misc/phoneType";
import { push } from "connected-react-router";
import { useAppDispatch } from "store";

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

  const dispatch = useAppDispatch();

  const getHolder = useHolder();
  const getDepartment = useDepartment();
  const getType = usePhoneType();

  const [bind] = useInput({ tab: "category" });

  const type = getType(phone.model?.phoneTypeId);
  const typeName = getPhoneTypeName(type);
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
          onSelect={() => dispatch(push(`/category/view?ids=${cat.id}`))}
          key={cat.id}
          status={cat.status ?? null}
          deletable={edit}
          actUrl={cat.actUrl}
          actDate={new Date(cat.actDate)}
          category={Number.parseInt(cat.categoryKey)}
        />
      ))
    ) : (
      <Header align="center">?????????????????? ??????????????????????.</Header>
    );

  const renderHoldings = () =>
    (phone.holdings?.length ?? 0) > 0 ? (
      phone.holdings?.map((hold) => (
        <HoldingItem
          departmentId={hold.departmentId}
          holderId={hold.holderId}
          orderUrl={hold.orderUrl}
          status={hold.status ?? null}
          department={getDepartmentName(getDepartment(hold.departmentId))}
          onSelect={() => onSelectHolding(hold.id)}
          key={hold.id}
          orderDate={new Date(hold.orderDate ?? Date.now())}
          orderKey={hold.orderKey}
          holder={splitHolderName(hold.holder)}
        />
      ))
    ) : (
      <Header align="center"> ???????????????? ??????????????????????.</Header>
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

  // TODO: ???????????????? ?????????? ?????? Input-????????????????

  const changedValue = (changes.find(
    (c) => c.id.toString() === field.targetId.toString()
  ) ?? {})[field.key];

  const lifespan = type?.lifespan;
  // TODO: ?????????????????????? ???????? ???????????????????????? ???????? ????????????????
  const toMonths = 1000 * 60 * 60 * 24 * 30;
  const now =
    (phone.categories ?? [])[0]?.categoryKey === "4"
      ? new Date((phone.categories ?? [])[0].actDate).getTime()
      : Date.now();
  const comissioning = new Date(phone.commissioningDate).getTime();

  const diff = lifespan
    ? now / toMonths - (comissioning / toMonths + lifespan)
    : null;

  return (
    <>
      {/* <Layout padding="md" flex="1"> */}
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
              {edit ? "??????????????????" : "????????????????"}
            </Badge>
          </ButtonGroup>
          <span style={{ margin: "auto" }}>
            ???????????????? ?????????? #{phone.id} ({phone.model?.name})
            {phone.status === "create-pending" ? (
              <Link href={`/phone/commit/actions?id=${phone.id}`}>
                <Span
                  style={{ marginLeft: "1rem" }}
                  inline
                  color="primary"
                  weight="bold"
                >
                  ???????????????? ????????????????
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
                  ???????????????? ????????????????
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
          style={{ minWidth: "323px" }}
          // position="vertical"
          name="tab"
          items={[
            {
              id: "category",
              name: `?????????????????? (${phone.categories?.length ?? 0})`,
            },
            {
              id: "holding",
              name: `???????????????? (${phone.holdings?.length ?? 0})`,
            },
          ]}
        />
      </PopupTopBar>
      <Layout padding="md" flow="row" flex="1">
        <Layout flex="1">
          <ListItem label="??????">
            <Span>{typeName}</Span>
          </ListItem>
          <ListItem label="????????????">
            <Span>{modelName}</Span>
          </ListItem>
          <EditableListItem
            label="?????????????????? ??????????"
            onOpen={handleFieldEdit("?????????? ?????????????????? ??????????")}
            propertyKey="factoryKey"
            editable={edit}
          >
            {phone.factoryKey}
          </EditableListItem>
          <EditableListItem
            label="?????????????????????? ??????????"
            onOpen={handleFieldEdit("?????????? ?????????????????????? ??????????")}
            propertyKey="inventoryKey"
            editable={edit}
          >
            {phone.inventoryKey}
          </EditableListItem>
          <Hr />
          <EditableListItem
            label="?????? ????????????"
            onOpen={handleFieldEdit("?????????? ?????? ????????????", "number")}
            propertyKey="assemblyDate"
            editable={edit}
            mapper={(v) => new Date(v).getFullYear()}
          >
            {assemblyDate}
          </EditableListItem>
          <ListItem label="??????????????????????">
            <Span>
              {diff == null
                ? "???? ??????????????"
                : diff < 0
                ? `???????????????? ${Math.abs(diff).toFixed(2)} ??????.`
                : `???????????????????????? ${diff.toFixed(2)} ??????.`}
            </Span>
          </ListItem>
          <Hr />
          <EditableListItem
            label="???????? ???????????????? ?? ??????????"
            onOpen={handleFieldEdit("?????????? ???????? ???????????????? ?? ??????????", "date")}
            propertyKey="accountingDate"
            editable={edit}
            mapper={(v) => new Date(v).toLocaleDateString()}
          >
            {accountingDate}
          </EditableListItem>
          <EditableListItem
            label="???????? ?????????? ?? ????????????????????????"
            onOpen={handleFieldEdit("?????????? ???????? ?????????? ?? ????????????????????????", "date")}
            propertyKey="commissioningDate"
            editable={edit}
            mapper={(v) => new Date(v).toLocaleDateString()}
          >
            {commissioningDate}
          </EditableListItem>
          <Hr />
          {holder ? (
            <>
              <ListItem label="??????????????????????????">
                <Span>{departmentName}</Span>
              </ListItem>
              <ListItem label="??????????????????????-?????????????????????????? ????????">
                <Link href="/phone/edit" isMonospace>
                  {splitHolderName(holder)}
                </Link>
              </ListItem>
            </>
          ) : (
            <Header align="center">
              ??????????????????????-?????????????????????????? ???????? ??????????????????????. ???????????????? ?????? ?? ??????????????
              ????????????????
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
                {deletePhoneStatus.isLoading ? <LoaderIcon /> : "??????????????"}
              </Button>
            </PhoneEditActions>
          </>
        ) : (
          ""
        )}
        <Hr vertical />
        <Layout className="phone-popup__sidebar" padding="md">
          {bind.input.tab === "category"
            ? renderCategories()
            : renderHoldings()}
        </Layout>
      </Layout>
      {/* </Layout> */}
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
      <WithLoader status={phoneStatus}>
        <Content
          phone={
            phone ?? {
              id: 0,
              accountingDate: "10.10.2003",
              assemblyDate: "10.10.2003",
              authorId: 0,
              commissioningDate: "10.10.2003",
              phoneModelId: 0,
            }
          }
          {...rest}
          fetchPhoneStatus={phoneStatus}
        />
      </WithLoader>
    </Popup>
  );
};

export default PhonePopup;
