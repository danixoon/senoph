import ActionBox from "components/ActionBox";
import AltPopup from "components/AltPopup";
import Badge from "components/Badge";
import Button from "components/Button";
import Dropdown from "components/Dropdown";
import Form, { FormContext } from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Layout from "components/Layout";
import SpoilerPopup, { SpoilerPopupButton } from "components/SpoilerPopup";
import Table, { TableColumn } from "components/Table";
import WithLoader from "components/WithLoader";
import {
  getPhoneTypeName,
  usePhoneType,
  usePhoneTypeByModel,
} from "hooks/misc/phoneType";
import { useInput } from "hooks/useInput";
import { useTimeout } from "hooks/useTimeout";
import { useTogglePayloadPopup } from "hooks/useTogglePopup";
import ItemEditPopup from "layout/Popups/ItemEditPopup";
import { NoticeContext } from "providers/NoticeProvider";
import PopupLayer from "providers/PopupLayer";
import React, { DetailedHTMLProps } from "react";
import { api } from "store/slices/api";
import { extractStatus } from "store/utils";

export type PhoneModelsProps = {};

const useContainer = () => {
  const models = api.useFetchPhoneModelQuery({});
  const [deletePhoneModel, deleteStatus] = api.useDeletePhoneModelMutation();
  const [createPhoneModel, createStatus] = api.useCreatePhoneModelMutation();
  const [editPhoneModel, editStatus] = api.useEditPhoneModelMutation();
  const getPhoneType = usePhoneType();
  const types = api.useFetchPhoneTypesQuery({});

  return {
    models: {
      ...models,
      items: models.data?.items ?? [],
      status: extractStatus(models, true),
    },
    types: { ...types, items: types.data?.items ?? [] },
    deletePhoneModel,
    deleteStatus: extractStatus(deleteStatus),
    createStatus: extractStatus(createStatus),
    editStatus: extractStatus(editStatus),
    createPhoneModel,
    editPhoneModel,
    getPhoneType,
  };
};

const detailsMap: Record<string, string> = {
  gold: "Золото",
  silver: "Серебро",
  platinum: "Платина",
  mpg: "МПГ",
};

const DetailsList: React.FC<{
  onCreate: (type: string, amount: number) => void;
  onDelete: (name: string) => void;
  details: Detail[];
  map: Record<string, string>;
}> = ({ onCreate, onDelete, details, map }) => (
  <>
    <CreateDetailButton details={map} onCreate={onCreate} />
    {details.length === 0 ? (
      <Badge>Нет драг. металлов</Badge>
    ) : (
      details.map((detail) => (
        <Badge key={detail.name}>
          <Button
            inverted
            color="primary"
            onClick={() => onDelete(detail.name)}
          >
            <Icon.X />
          </Button>
          {detailsMap[detail.name]}: {detail.amount} {detail.units}.
        </Badge>
      ))
    )}
  </>
);
type Detail = Omit<DB.PhoneModelDetailAttributes, "modelId">;

const useEditedDetails = (id: number, originalDetails: Detail[]) => {
  // const originalDetails = editedPhoneModel.details ?? [];

  const [details, setDetails] = React.useState<Detail[]>(
    () => originalDetails ?? []
  );

  React.useEffect(() => {
    setDetails(originalDetails ?? []);
  }, [id]);

  const map = Object.fromEntries(
    Object.entries(detailsMap).filter(
      ([name]) => !details.find((det) => det.name === name)
    )
  );

  return { details, setDetails, map };
};

const PhoneModels: React.FC<PhoneModelsProps> = (props) => {
  const {
    models,
    types,
    deletePhoneModel,
    createPhoneModel,
    editPhoneModel,
    getPhoneType,
    createStatus,
    deleteStatus,
    editStatus,
  } = useContainer();

  const noticeContext = React.useContext(NoticeContext);

  React.useEffect(() => {
    if (createStatus.isLoading)
      noticeContext.createNotice("Создание модели...");
    if (createStatus.isSuccess)
      noticeContext.createNotice("Модель успешно создана.");
    if (createStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при создании модели: (${createStatus.error?.name}) ${createStatus.error?.description}`
      );
  }, [createStatus.status]);

  React.useEffect(() => {
    if (deleteStatus.isLoading)
      noticeContext.createNotice("Удаление модели...");
    if (deleteStatus.isSuccess)
      noticeContext.createNotice("Модель успешно удалена.");
    if (deleteStatus.isError)
      noticeContext.createNotice(
        `Произошла ошибка при удалении модели: (${deleteStatus.error?.name}) ${deleteStatus.error?.description}`
      );
  }, [deleteStatus.status]);

  const columns: TableColumn[] = [
    {
      key: "actions",
      header: "",
      size: "30px",
      required: true,
      mapper: (v, item) => (
        <ActionBox status={deleteStatus}>
          <SpoilerPopupButton onClick={() => editPopup.onToggle(true, item)}>
            Изменить
          </SpoilerPopupButton>
          <SpoilerPopupButton onClick={() => deletePhoneModel({ id: item.id })}>
            Удалить
          </SpoilerPopupButton>
        </ActionBox>
      ),
    },
    {
      key: "id",
      header: "ID",
      size: "30px",
    },
    {
      key: "name",
      header: "Наименование",
    },
    {
      key: "phoneTypeId",
      header: "Тип СС",
      mapper: (v, item: DB.PhoneModelAttributes) =>
        getPhoneTypeName(getPhoneType(item.phoneTypeId)),
    },
    {
      key: "description",
      header: "Описание",
    },
    {
      key: "details",
      header: "Драг. металлы",
      mapper: (details: DB.PhoneModelDetailAttributes[] = []) =>
        details.map((detail) => (
          <>
            {detailsMap[detail.name]}: <b>{detail.amount}</b> {detail.units}.
            <br />
          </>
        )),
    },
  ];

  const [bind] = useInput({});

  const tableItems = models.items.map((type) => type);

  const [details, setDetails] = React.useState<Detail[]>(() => [] as any);

  const { state: editedPhoneModel, ...editPopup } = useTogglePayloadPopup<
    Api.Models.PhoneModel | undefined
  >();

  const editedDetails = useEditedDetails(
    editedPhoneModel?.id ?? -1,
    editedPhoneModel?.details ?? []
  );

  return (
    <>
      <PopupLayer>
        <ItemEditPopup
          {...editPopup}
          status={editStatus}
          defaults={editedPhoneModel}
          onReset={() =>
            editedDetails.setDetails(editedPhoneModel?.details ?? [])
          }
          onSubmit={(payload) =>
            editPhoneModel({
              id: editedPhoneModel?.id ?? -1,
              name: payload.name,
              description: payload.description,
              details: editedDetails.details ?? [],
            })
          }
          items={[
            {
              name: "name",
              content: ({ bind, name, disabled }) => (
                <Input {...bind} required label="Наименование" name={name} />
              ),
            },
            {
              name: "phoneTypeId",
              nullable: true,
              content: ({ bind, name, disabled }) => (
                <Dropdown
                  {...bind}
                  items={types.items.map((type) => ({
                    label: type.name,
                    id: type.id,
                  }))}
                  required
                  label="Тип СС"
                  name={name}
                  disabled={disabled}
                />
              ),
            },
            {
              name: "description",
              content: ({ bind, name, disabled }) => (
                <Input {...bind} label="Описание" name={name} />
              ),
            },
            {
              name: "details",
              content: ({ bind, name }) => {
                return (
                  <Layout flow="row wrap">
                    <DetailsList
                      onCreate={(type, amount) =>
                        editedDetails.setDetails([
                          ...editedDetails.details,
                          {
                            name: type,
                            amount,
                            units: "гр",
                            type: "preciousMetal",
                          },
                        ])
                      }
                      onDelete={(name) =>
                        editedDetails.setDetails(
                          editedDetails.details.filter(
                            (det) => det.name !== name
                          )
                        )
                      }
                      details={editedDetails.details}
                      map={editedDetails.map}
                    />
                  </Layout>
                );
              },
            },
          ]}
        />
      </PopupLayer>
      <Layout>
        <Form
          input={bind.input}
          onSubmit={(data) => {
            createPhoneModel({ ...data, details });
          }}
        >
          <Layout flow="row">
            <Input
              required
              placeholder="DA 310"
              label="Наименование"
              {...bind}
              name="name"
              style={{ flex: "1" }}
            />
            <Dropdown
              required
              style={{ flex: "1" }}
              label="Тип СС"
              name="phoneTypeId"
              items={types.items.map((type) => ({
                id: type.id,
                label: type.name,
              }))}
              {...bind}
            />
            <Input
              label="Описание"
              placeholder="Информация по модели"
              {...bind}
              name="description"
              style={{ flex: "1" }}
            />
          </Layout>
          <Layout flow="row" padding="md">
            <DetailsList
              onCreate={(type, amount) =>
                setDetails([
                  ...details,
                  { name: type, amount, units: "гр", type: "preciousMetal" },
                ])
              }
              onDelete={(name) =>
                setDetails(details.filter((det) => det.name !== name))
              }
              details={details}
              map={Object.fromEntries(
                Object.entries(detailsMap).filter(
                  ([name]) => !details.find((det) => det.name === name)
                )
              )}
            />
            <Button
              disabled={createStatus.isLoading}
              style={{
                marginTop: "auto",
                marginLeft: "auto",
                padding: "0 4rem",
              }}
              margin="md"
              type="submit"
              color="primary"
            >
              {createStatus.isLoading ? <LoaderIcon /> : "Создать"}
            </Button>
          </Layout>
        </Form>
        <Hr />
        <Header align="right">
          Список моделей средств связи ({models.items.length})
        </Header>
        <WithLoader status={models.status}>
          <Table items={tableItems} columns={columns} />
        </WithLoader>
      </Layout>
    </>
  );
};

const CreateDetailButton = React.forwardRef<
  HTMLButtonElement,
  {
    onCreate: (name: string, amount: number) => void;
    details: Record<string, string>;
  }
>((props, ref) => {
  const [target, setTarget] = React.useState<HTMLElement | null>(() => null);

  const [isOpen, setIsOpen] = React.useState(() => false);
  const [bind] = useInput({ name: null, amount: "" });
  const dropdownItems = Object.entries(props.details).map(([id, label]) => ({
    id,
    label,
  }));

  const amount = Number(bind.input.amount?.replace(",", ".") ?? "0");
  const [show, message, toggleMessage] = useTimeout<string | null>(null, 2000);
  const inputRef = React.useRef<HTMLElement | null>(null);

  // React.useEffect(() => {
  //   if (show) setTimeout(() => inputRef.current?.focus());
  // }, [show]);

  React.useEffect(() => {
    if (!isOpen) setTimeout(() => target?.focus(), 1000);
  }, [isOpen]);

  return (
    <Button
      ref={(r) => {
        setTarget(r);
        if (ref) typeof ref === "function" ? ref(r) : (ref.current = r);
      }}
      color="primary"
      inverted
      onClick={() => {
        setIsOpen(true);
      }}
    >
      <Icon.PlusCircle />
      <SpoilerPopup
        target={isOpen ? target : null}
        position="bottom"
        onBlur={(e) => {
          const currentTarget = e.currentTarget;
          setTimeout(() => {
            if (
              inputRef.current &&
              !currentTarget.contains(document.activeElement)
            ) {
              setIsOpen(false);
            }
          });
        }}
      >
        <Dropdown label="Металл" items={dropdownItems} name="name" {...bind} />
        <Input
          label="Количество (гр.)"
          name="amount"
          {...bind}
          type="number"
          placeholder="0.001"
          ref={(r) => (inputRef.current = r)}
        />
        <Button
          disabled={
            amount <= 0 ||
            dropdownItems.length === 0 ||
            bind.input.name === null
            // Number.isNaN(amount)
          }
          color="primary"
          size="sm"
          onClick={() => {
            if (Number.isNaN(amount))
              toggleMessage("Неверно указано количество");
            else {
              props.onCreate(bind.input.name ?? "", amount);
              inputRef.current?.focus();
            }
          }}
        >
          Добавить
        </Button>
        <AltPopup
          target={show && message ? inputRef.current : null}
          position="bottom"
        >
          {message}
        </AltPopup>
      </SpoilerPopup>
    </Button>
  );
});

export default PhoneModels;
