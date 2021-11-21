import React from "react";
import Button from "components/Button";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Span from "components/Span";
import Input from "components/Input";
import ClickInput from "components/ClickInput";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import { useFileInput, useInput } from "hooks/useInput";
import Form from "components/Form";
import ModelSelectionPopupContainer from "containers/ModelSelectionPopup";
import { useFetchConfigMap } from "hooks/api/useFetchConfigMap";
import { importPhone } from "api/import";
import { NoticeContext } from "providers/NoticeProvider";
import { useTogglePopup } from "hooks/useTogglePopup";
import { clearObject, isResponse } from "utils";

import "./style.styl";

export type PhoneCreatePopupProps = OverrideProps<
  PopupProps,
  {
    createPhones: (phones: Api.GetBody<"post", "/phone">["data"]) => any;
    status: ApiStatus;
  }
>;

const AddedItem: React.FC<{
  inventoryKey: string;
  factoryKey: string;
  accountingDate: Date;
  comissioningDate: Date;
  assemblyYear: number;
  phoneModelName: string;
  onRemove: () => void;
}> = (props) => {
  const {
    phoneModelName: model,
    inventoryKey,
    factoryKey,
    accountingDate,
    assemblyYear,
    comissioningDate,
    onRemove,
  } = props;
  return (
    <>
      <Layout className="added-item" flow="row">
        <Button inverted color="primary" onClick={onRemove}>
          <Icon.X />
        </Button>
        <Hr vertical />
        <Layout flex="1">
          <Layout flow="row">
            <Label>{model}</Label>
            <Hr vertical />
            <Span font="monospace">{inventoryKey}</Span>
            <Hr vertical />
            <Span font="monospace">{factoryKey}</Span>
          </Layout>
          <Hr />
          <Layout flow="row">
            <Span>{comissioningDate.toDateString()}</Span>
            <Hr vertical />
            <Span style={{ marginRight: "auto" }}>
              {accountingDate.toDateString()}
            </Span>
            <Hr vertical />
            <Span>{assemblyYear}</Span>
            {/* <Hr vertical />
            <Header className="added-item__holder">
              <Icon.User /> {holder}
            </Header> */}
          </Layout>
        </Layout>
      </Layout>
      <Hr />
    </>
  );
};

type InputType = {
  inventoryKey: string;
  factoryKey: string;

  accountingDate: string;
  assemblyDate: string;
  commissioningDate: string;

  phoneModelId: number;

  holderId: number;
  assemblyYear: number;
  phoneModelName: string;
};
type AddedItem = {
  payload: Omit<Api.Models.Phone, "authorId" | "id">;
  item: {
    phoneModelName: string;
    assemblyYear: number;
    id: any;
  };
};
const PhoneCreatePopup: React.FC<PhoneCreatePopupProps> = (props) => {
  const { createPhones, status, ...rest } = props;

  const [bind, setBind] = useInput<InputType>();

  const modelPopup = useTogglePopup();
  const [addedPhones, setAddedPhones] = React.useState<AddedItem[]>(() => []);

  const handleSubmit = () => {
    const { phoneModelName, assemblyYear, ...rest } = clearObject(bind.input);
    const year = parseInt(assemblyYear as string);
    const phone: AddedItem = {
      item: {
        phoneModelName,
        assemblyYear: year,
        id: Math.random(),
      },
      payload: {
        ...rest,
        phoneModelId: Number(rest.phoneModelId),
        assemblyDate: new Date(1, 1, year).toISOString(),
      },
    };

    const isFuckedUp = addedPhones.some(({ payload }) => {
      if (payload.factoryKey === phone.payload.factoryKey) {
        noticeContext.createNotice(
          "Ошибка: Невозможно добавить средство связи с одинаковыми заводскими номерами."
        );
        return true;
      }
      if (payload.inventoryKey === phone.payload.inventoryKey) {
        noticeContext.createNotice(
          "Ошибка: Невозможно добавить средство связи с одинаковыми инвентарными номерами."
        );
        return true;
      }
    });
    if (isFuckedUp) return;

    setAddedPhones([...addedPhones, phone]);
  };

  const handlePhonesSubmit = () => {
    createPhones(addedPhones.map((phone) => phone.payload));
  };

  React.useEffect(() => {
    if (status.isSuccess) {
      if (rest.onToggle) rest.onToggle(false);
      noticeContext.createNotice(
        "Средства связи успешно добавлены и ожидают подтверждения"
      );
    }
    if (status.isError) {
      noticeContext.createNotice(
        `Ошибка при добавлении: (${status.error?.name})` +
          status.error?.description
      );
    }
    if (status.isLoading)
      noticeContext.createNotice("Средства связи добавляются..");
  }, [status.status]);

  const submitRef = React.useRef<HTMLButtonElement | null>(null);
  const [bindImport, setImport, ref] = useFileInput();
  const noticeContext = React.useContext(NoticeContext);
  const { models, holders } = useFetchConfigMap();

  React.useEffect(() => {
    const file = (bindImport.files.file ?? [])[0];
    if (file) {
      importPhone(file)
        .catch((err) => {
          const { error } = err as { error: Api.Error };
          noticeContext.createNotice("Ошибка импорта: " + error.description);
          setImport({ file: null });
        })
        .then((result) => {
          if (!isResponse(result)) return console.log("response is:", result);

          setAddedPhones(
            result.items.map((item) => {
              const year = new Date(item.assemblyDate).getFullYear();
              const model = models.get(item.phoneModelId);
              return {
                payload: item,
                item: {
                  id: Math.random(),
                  assemblyYear: year,
                  phoneModelName:
                    model?.name ?? `Неизвестная модель #${item.phoneModelId}`,
                },
              };
            })
          );
        });
    }
  }, [bindImport.files.file]);

  return (
    <>
      <Popup {...rest} size="lg" closeable noPadding>
        <PopupTopBar>
          <Header
            align="center"
            hr
            style={{ flex: 1, display: "flex", alignItems: "center" }}
          >
            <Span style={{ margin: "auto" }}>
              Добавление нового средства связи
            </Span>
            <Link
              style={{ marginLeft: "auto", marginRight: "0.5rem" }}
              size="sm"
              color="primary"
              onClick={() => {
                ref?.click();
              }}
            >
              Импорт <Icon.Database color="primary" />
            </Link>
            <Link
              native
              size="sm"
              color="primary"
              href="/api/import?entity=phone"
            >
              Шаблон <Icon.Download color="primary" />
            </Link>
            <Input
              hidden
              name="file"
              type="file"
              inputProps={{ accept: ".xlsx" }}
              {...bindImport}
            />
          </Header>
        </PopupTopBar>
        <Layout padding="md" flow="row" flex="1">
          <Form onSubmit={() => handleSubmit()} input={bind.input}>
            <Layout flow="row">
              <Layout>
                <Input
                  {...bind}
                  name="inventoryKey"
                  label="Инвентарный номер"
                  required
                />
                <Input
                  {...bind}
                  name="factoryKey"
                  label="Заводской номер"
                  required
                />
                <ClickInput
                  {...bind}
                  name="phoneModelName"
                  label="Модель"
                  required
                  onActive={() => modelPopup.onToggle()}
                />
              </Layout>
              <Layout>
                <Input
                  {...bind}
                  type="number"
                  name="assemblyYear"
                  label="Год сборки"
                  required
                />
                <Input
                  {...bind}
                  type="date"
                  name="commissioningDate"
                  label="Дата ввода в эксплуатацию"
                  required
                />
                <Input
                  {...bind}
                  type="date"
                  name="accountingDate"
                  label="Дата учёта"
                  required
                />
              </Layout>
            </Layout>
            <Hr style={{ marginTop: "auto" }} />
            <Layout>
              <Button type="submit">Добавить</Button>
            </Layout>
          </Form>
          <Hr vertical />
          <Layout flex="1">
            <Layout className="added-list">
              <Header align="right">
                {addedPhones.length === 0
                  ? "Добавленые СС отсутствуют"
                  : "Добавленные СС"}
              </Header>
              <Hr />
              {addedPhones.map((phone) => (
                <AddedItem
                  key={phone.item.id}
                  inventoryKey={phone.payload.inventoryKey}
                  accountingDate={new Date(phone.payload.accountingDate)}
                  comissioningDate={new Date(phone.payload.commissioningDate)}
                  factoryKey={phone.payload.factoryKey}
                  onRemove={() =>
                    setAddedPhones(
                      addedPhones.filter((p) => p.item.id !== phone.item.id)
                    )
                  }
                  {...phone.item}
                />
              ))}
            </Layout>
            <Hr style={{ marginTop: "auto" }} />
            <Layout>
              <Button
                color="primary"
                disabled={addedPhones.length === 0 || status.isLoading}
                onClick={handlePhonesSubmit}
                ref={submitRef}
              >
                {status.isLoading ? <LoaderIcon /> : "Применить"}
              </Button>
            </Layout>
          </Layout>
        </Layout>
      </Popup>
      <ModelSelectionPopupContainer
        {...modelPopup}
        onSelect={(id, name) =>
          setBind({ ...bind.input, phoneModelId: id, phoneModelName: name })
        }
      />
    </>
  );
};

export default PhoneCreatePopup;
