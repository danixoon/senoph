import Badge from "components/Badge";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Dropdown from "components/Dropdown";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
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
import { useFetchConfig } from "hooks/api/useFetchConfig";
import { InputBind, useInput } from "hooks/useInput";
import * as React from "react";
import { Edit, Edit2, Edit3 } from "react-feather";
import qs from "query-string";

import "./style.styl";
import Paginator from "components/Paginator";
import PhoneEditActions from "layout/PhoneEditActions";
import FieldEditPopup from "layout/Popups/FieldEditPopup";
import PopupLayer from "providers/PopupLayer";

type PhoneListItem = {
  id: any;
  name: string;
  inventoryKey: string;
};

export type PhoneSelectionPopup = OverrideProps<
  PopupProps,
  {
    bind: InputBind;

    pageItems: number;
    totalItems: number;

    offset: number;
    onOffsetChange: (offset: number) => void;
    onDeselect: (id: any) => void;
    onDeselectAll: () => void;

    items: PhoneListItem[];
    selectedIds: number[];

    deletePhonesStatus: ApiStatus;
    deletePhones: (ids: number[]) => void;
  }
>;

// const Content: React.FC<{}> = (props) => {

// };

const PhoneItem: React.FC<{
  id: any;
  inventoryKey: string;
  modelName: string;
  href: string;
  onDelete: () => void;
}> = (props) => {
  const { id, modelName, inventoryKey, href, onDelete } = props;
  return (
    <Layout flow="row">
      <Button color="primary" inverted onClick={onDelete}>
        <Icon.X />
      </Button>
      <Hr vertical />
      <Link isMonospace href={href} style={{ marginRight: "0.25rem" }}>
        #{id} {modelName}
      </Link>
      <Header style={{ marginLeft: "auto" }}>{inventoryKey}</Header>
    </Layout>
  );
};

const PhoneSelectionPopup: React.FC<PhoneSelectionPopup> = (props) => {
  const {
    bind,
    pageItems,
    totalItems,
    items,
    offset,
    onOffsetChange,
    onDeselect,
    onDeselectAll,
    deletePhones,
    deletePhonesStatus,
    selectedIds,
    ...rest
  } = props;

  const maxPage = Math.ceil(totalItems / pageItems);
  let currentPage = Math.floor((offset / totalItems) * maxPage) + 1;
  if (Number.isNaN(currentPage)) currentPage = 1;

  const handlePage = (page: number) => {
    onOffsetChange((page - 1) * pageItems);
  };

  React.useEffect(() => {
    // console.log(totalItems);
    // if (bind.input.search === null && totalItems === 0 && props.isOpen && props.onToggle)
    //   props.onToggle(false);
    if (currentPage > maxPage) {
      const nextOffset = (maxPage - 1) * pageItems;
      onOffsetChange(nextOffset < 0 ? 0 : nextOffset);
    }
  }, [items.length]);

  return (
    <>
      <Popup {...rest} size="md" closeable noPadding>
        <PopupTopBar>
          <Header align="center" hr style={{ flex: 1 }}>
            Выбранные средства связи
          </Header>
        </PopupTopBar>
        <Layout padding="md" flow="row" flex="1">
          <Layout flex="2">
            <Header
              align="left"
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: "25px",
              }}
            >
              Выборка
              <Input
                {...bind}
                inputProps={{ placeholder: "Фильтр.." }}
                name="search"
                size="xs"
                style={{ margin: "0 0 0 1rem", flex: "1" }}
              />
            </Header>
            <Hr />
            <Layout flex="1">
              {items.length === 0 ? (
                bind.input.search !== null ? (
                  <Header>Результаты по запросу отсутствуют</Header>
                ) : (
                  <Header>Выделение отсутствует</Header>
                )
              ) : (
                items.map((item) => {
                  const q = { ...bind.input, selectedId: item.id };
                  return (
                    <PhoneItem
                      onDelete={() => onDeselect(item.id)}
                      href={`/phone/edit?${qs.stringify(q)}`}
                      modelName={item.name}
                      inventoryKey={item.inventoryKey}
                      id={item.id}
                      key={item.id}
                    />
                  );
                })
              )}
            </Layout>
            {totalItems > pageItems ? (
              <Paginator
                style={{ margin: "0 auto" }}
                onChange={handlePage}
                min={1}
                max={maxPage}
                current={currentPage}
                size={5}
              />
            ) : (
              ""
            )}
            <Hr />
            <Button
              onClick={() => {
                onDeselectAll();
                if (props.onToggle) props.onToggle(false);
              }}
            >
              Очистить выделение
            </Button>
          </Layout>
          <Hr vertical />
          <Layout flex="1">
            <Header
              align="right"
              style={{
                minHeight: "25px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Действия с выбранным
            </Header>
            <Hr />
            <PhoneEditActions flex="1" phoneIds={selectedIds}>
              <Button
                onClick={() => deletePhones(selectedIds)}
                color="primary"
                style={{ marginTop: "auto" }}
                disabled={deletePhonesStatus.isLoading}
              >
                {deletePhonesStatus.isLoading ? <LoaderIcon /> : "Удалить всё"}
              </Button>
            </PhoneEditActions>
          </Layout>
        </Layout>
      </Popup>
    </>
  );
};

export default PhoneSelectionPopup;
