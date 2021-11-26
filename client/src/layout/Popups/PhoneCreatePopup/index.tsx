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
import HolderSelectionPopupContainer from "containers/HolderSelectionPopup";
import PopupLayer from "providers/PopupLayer";
import Checkbox from "components/Checkbox";
import { HoldingItem } from "layout/Pages/HoldingPage";

export type PhoneCreatePopupProps = OverrideProps<
  PopupProps,
  {
    createdPhoneIds: { id: number; randomId: string }[];
    createPhones: (phones: Api.GetBody<"post", "/phone">["data"]) => any;
    createHoldings: (holdings: Api.GetBody<"post", "/holding">) => any;
    phonesStatus: ApiStatus;
    holdingsStatus: ApiStatus;
  }
>;

const AddedItem: React.FC<{
  inventoryKey: string | null;
  factoryKey: string | null;
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
  inventoryKey: string | null;
  factoryKey: string | null;

  accountingDate: string;
  assemblyDate: string;
  commissioningDate: string;

  phoneModelId: number;

  holderId: number;
  holderName: string;
  assemblyYear: number;
  phoneModelName: string;
};
type AddedItem = {
  payload: WithRandomId<Omit<Api.Models.Phone, "authorId" | "id">>;
  item: {
    phoneModelName: string;
    assemblyYear: number;
  };
};
type AddedHolding = {
  holderId: number;
  orderDate: string;
  orderKey: string;
  phoneRandomIds: string[];
};
const PhoneCreatePopup: React.FC<PhoneCreatePopupProps> = (props) => {
  const {
    createdPhoneIds,
    createPhones,
    createHoldings,
    holdingsStatus,
    phonesStatus,
    ...rest
  } = props;

  const [bind, setBind] = useInput<InputType>();

  const [bindHolding, setBindHolding] = useInput<{
    isHolded: boolean;
    holderName: string;
    holderId: number;
    orderDate: string;
    orderKey: string;
  }>({
    isHolded: false,
    holderName: null,
    holderId: null,
    orderDate: null,
    orderKey: null,
  });

  const modelPopup = useTogglePopup();
  const [creations, setCreations] = React.useState<{
    phones: AddedItem[];
    holdings: AddedHolding[];
  }>(() => ({ phones: [], holdings: [] }));

  const handleSubmit = () => {
    const { phoneModelName, assemblyYear, ...rest } = clearObject(bind.input);
    const { isHolded, holderId, orderDate, orderKey } = clearObject(
      bindHolding.input
    );
    const year = parseInt(assemblyYear as string);
    const phone: AddedItem = {
      item: {
        phoneModelName,
        assemblyYear: year,
      },
      payload: {
        ...rest,
        randomId: Math.random().toString(),
        phoneModelId: Number(rest.phoneModelId),
        assemblyDate: new Date(year, 1, 1).toISOString(),
      },
    };

    // const holding: HoldingItem | null = !isHolded
    //   ? null
    //   : {
    //       holderId,
    //       orderDate,
    //       orderKey,
    //       reasonId: "movement",

    //     };

    const isFuckedUp = creations.phones.some(({ payload }) => {
      if (
        payload.factoryKey !== undefined &&
        payload.factoryKey === phone.payload.factoryKey
      ) {
        noticeContext.createNotice(
          "Ошибка: Невозможно добавить средство связи с одинаковыми заводскими номерами."
        );
        return true;
      }
      if (
        payload.inventoryKey !== undefined &&
        payload.inventoryKey === phone.payload.inventoryKey
      ) {
        noticeContext.createNotice(
          "Ошибка: Невозможно добавить средство связи с одинаковыми инвентарными номерами."
        );
        return true;
      }
    });
    if (isFuckedUp) return;

    setCreations({ ...creations, phones: [...creations.phones, phone] });
  };

  const handlePhonesSubmit = () => {
    const { holdings, phones } = creations;
    createPhones(phones.map((phone) => phone.payload));
  };

  React.useEffect(() => {
    if (!phonesStatus.isSuccess || holdingsStatus.isSuccess) return;
    const { holdings, phones } = creations;
    // const phoneIds = createdPhoneIds;
    for (const holding of holdings) {
      const phoneIds = holding.phoneRandomIds
        .map(
          (id) =>
            createdPhoneIds.find((createdId) => createdId.randomId === id)?.id
        )
        .filter((v) => v) as number[];
      createHoldings({
        holderId: holding.holderId,
        phoneIds,
        orderDate: holding.orderDate,
        orderKey: holding.orderKey,
        reasonId: "movement",
      });
    }
    // createHoldings({  })
  }, [phonesStatus.isSuccess]);

  React.useEffect(() => {
    if (phonesStatus.isSuccess) {
      if (rest.onToggle) rest.onToggle(false);
      noticeContext.createNotice(
        "Средства связи успешно добавлены и ожидают подтверждения"
      );
    }
    if (phonesStatus.isError) {
      noticeContext.createNotice(
        `Ошибка при добавлении: (${phonesStatus.error?.name})` +
          phonesStatus.error?.description
      );
    }
    if (phonesStatus.isLoading)
      noticeContext.createNotice("Средства связи добавляются..");
  }, [phonesStatus.status]);

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
          if (!isResponse(result)) return;

          const { phones, holdings } = result;
          setCreations({
            holdings,
            phones: phones.map((item) => {
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
            }),
          });
        });
    }
  }, [bindImport.files.file]);

  const holderPopup = useTogglePopup();
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
                <ClickInput
                  {...bind}
                  name="phoneModelName"
                  label="Модель"
                  placeholder="DA 310"
                  required
                  onActive={() => modelPopup.onToggle()}
                />
                <Input
                  {...bind}
                  name="inventoryKey"
                  label="Инвентарный номер"
                  placeholder="110xxxxxxxxx"
                />
                <Input
                  {...bind}
                  name="factoryKey"
                  placeholder="110xxxxxxxxx"
                  label="Заводской номер"
                />
              </Layout>
              <Layout>
                <Input
                  {...bind}
                  type="number"
                  name="assemblyYear"
                  placeholder="2008"
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
            <Header
              align="center"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              Привязывается к движению
              <Checkbox
                {...bindHolding}
                name="isHolded"
                // type="checkbox"
                containerProps={{ style: { margin: "0 0 0 1rem" } }}
              />
            </Header>
            <Layout flow="column">
              <Layout flow="row">
                <Input
                  {...bindHolding}
                  type="date"
                  name="orderDate"
                  placeholder="2008"
                  label="Дата приказа"
                  disabled={!bindHolding.input.isHolded}
                  required
                />
                <Input
                  {...bindHolding}
                  name="orderKey"
                  disabled={!bindHolding.input.isHolded}
                  label="Номер приказа"
                  required
                  style={{ flex: "1" }}
                />
              </Layout>
              <ClickInput
                {...bindHolding}
                name="holderName"
                disabled={!bindHolding.input.isHolded}
                label="Владелец"
                onActive={() => holderPopup.onToggle()}
                required
              />
              <PopupLayer>
                <HolderSelectionPopupContainer
                  {...holderPopup}
                  onSelect={(id, name) =>
                    setBindHolding({
                      ...bindHolding.input,
                      holderId: id,
                      holderName: name,
                    })
                  }
                />
              </PopupLayer>
            </Layout>
            <Hr />
            <Layout>
              <Button type="submit">Добавить</Button>
            </Layout>
          </Form>
          <Hr vertical />
          <Layout flex="1">
            <Layout className="added-list">
              <Header align="right">
                {creations.holdings.length > 0 ? (
                  <Layout>
                    {creations.holdings.map((holding) => {
                      return <Link>От {holding.orderKey}</Link>;
                    })}
                  </Layout>
                ) : (
                  ""
                )}
                {creations.phones.length === 0
                  ? "Добавленые СС отсутствуют"
                  : "Добавленные СС"}
              </Header>
              <Hr />
              {creations.phones.map((phone) => (
                <AddedItem
                  key={phone.payload.randomId}
                  inventoryKey={phone.payload.inventoryKey ?? null}
                  accountingDate={new Date(phone.payload.accountingDate)}
                  comissioningDate={new Date(phone.payload.commissioningDate)}
                  factoryKey={phone.payload.factoryKey ?? null}
                  onRemove={() =>
                    setCreations({
                      ...creations,
                      phones: creations.phones.filter(
                        (p) => phone.payload.randomId !== phone.payload.randomId
                      ),
                    })
                  }
                  {...phone.item}
                />
              ))}
            </Layout>
            <Hr style={{ marginTop: "auto" }} />
            <Layout>
              <Button
                color="primary"
                disabled={
                  creations.phones.length === 0 || phonesStatus.isLoading
                }
                onClick={handlePhonesSubmit}
                ref={submitRef}
              >
                {phonesStatus.isLoading ? <LoaderIcon /> : "Применить"}
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
