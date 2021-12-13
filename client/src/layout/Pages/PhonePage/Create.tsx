import React from "react";
import qs from "query-string";
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
import { useCreatePhones } from "hooks/api/useCreatePhones";
import TopBarLayer from "providers/TopBarLayer";
import { useAppDispatch } from "store";
import { extractStatus, parseItems } from "store/utils";
import { api } from "store/slices/api";
import { getDefaultColumns } from "./Items";
import Table, { TableColumn } from "components/Table";
import { replace } from "connected-react-router";
import { useLocation } from "react-router";
import { useNotice } from "hooks/useNotice";
import Toggle from "components/Toggle";
import { getDepartmentName, useDepartment } from "hooks/misc/department";
import { splitHolderName, useHolder } from "hooks/misc/holder";
import ButtonGroup from "components/ButtonGroup";

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

type InputType = {
  inventoryKey: string | null;
  factoryKey: string | null;

  accountingDate: string;
  assemblyDate: string;
  commissioningDate: string;

  phoneModelId: number;

  holderId: number;
  departmentId: number;
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
  id?: number;
  holderId: number;
  departmentId: number;
  orderDate: string;
  orderKey: string;
  merge: boolean;
  phoneRandomIds: string[];
};

const useContainer = () => {
  const dispatch = useAppDispatch();
  const [createPhones, phoneInfo] = useCreatePhones();
  const [createHolding, holdingInfo] = api.useCreateHoldingMutation();
  const [updateHolding, updateHoldingInfo] =
    api.useCreateHoldingChangeMutation();

  const location = useLocation();

  const onAddHolding = () =>
    dispatch(
      replace({
        pathname: "/holding/view",
        state: {
          referrer: location.pathname,
          header: "Выберите движения для прикрепления",
          act: "select",
          referrerSearch: location.search,
        },
      })
    );

  const { state, search } = useLocation<{ selectedId?: string }>();
  const selectedId = parseInt(state?.selectedId as string);

  const srch = qs.parse(search);

  const fetchSelectedHolding = parseItems(
    api.useFetchHoldingsQuery(
      { ids: [selectedId as number] },
      { skip: isNaN(selectedId) }
    )
  );

  const onDelHolding = () => dispatch(replace({ state: undefined }));

  return {
    createdPhoneIds: phoneInfo.data?.created ?? [],
    createPhones,
    createHoldings: (body: any) => createHolding(body as any),
    phonesStatus: extractStatus(phoneInfo),
    holdingsStatus: extractStatus(holdingInfo),
    onAddHolding,
    onDelHolding,
    setSearch: (q: any) =>
      dispatch(
        replace({ ...location, search: qs.stringify({ ...srch, ...q }) })
      ),
    selectedHolding: {
      data: !isNaN(selectedId) ? fetchSelectedHolding.data?.items[0] : null,
      status: fetchSelectedHolding.status,
    },
    updateHolding,
    updateHoldingStatus: extractStatus(updateHoldingInfo),
    search: srch as Partial<Record<string, string>>,
  };
};

const Create: React.FC<{}> = (props) => {
  const [bind, setBind] = useInput<InputType>();
  const {
    createdPhoneIds,
    createPhones,
    createHoldings,
    updateHolding,
    updateHoldingStatus,
    onAddHolding,
    onDelHolding,
    phonesStatus,
    holdingsStatus,
    selectedHolding,
    search,
    setSearch,
  } = useContainer();

  const [bindHolding, setBindHolding] = useInput<{
    isHolded: boolean;
    holderName: string;
    departmentId: number;
    holderId: number;
    orderDate: string;
    orderKey: string;
  }>({
    isHolded: false,
    holderName: null,
    holderId: null,
    departmentId: null,
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
    const year = parseInt(assemblyYear as string);
    const randomId = Math.random().toString();
    const phone: AddedItem = {
      item: {
        phoneModelName,
        assemblyYear: year,
      },
      payload: {
        ...rest,
        randomId,
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

    const newCreations = { ...creations, phones: [...creations.phones, phone] };
    if (selectedHolding.data?.id) {
      const ex = newCreations.holdings.find(
        (holding) => holding.id === selectedHolding.data?.id
      );

      ex?.phoneRandomIds.push(randomId);
    }

    setCreations(newCreations);
  };

  const handleCreationsClear = () => {
    setCreations({ phones: [], holdings: [] });
  };
  const handleCreationsSubmit = () => {
    const { holdings, phones } = creations;
    createPhones(phones.map((phone) => phone.payload));
  };

  useNotice(updateHoldingStatus, {
    loading: "Производится привязка к движению..",
  });
  useNotice(holdingsStatus, {
    loading: "Производится создание движения..",
  });
  useNotice(phonesStatus, {
    loading: "Производится создание средств связи..",
  });

  React.useEffect(() => {
    if (!phonesStatus.isSuccess || holdingsStatus.isSuccess) return;
    const { holdings, phones } = creations;

    // const createdHoldings: typeof holdings = [];
    // const mergedHoldings: typeof holdings = [];
    for (const holding of holdings) {
      const phoneIds = holding.phoneRandomIds
        .map(
          (id) =>
            createdPhoneIds.find((createdId) => createdId.randomId === id)?.id
        )
        .filter((v) => v) as number[];

      if (holding.merge)
        updateHolding({
          action: "add",
          holdingId: holding.id as number,
          phoneIds,
        });
      else
        createHoldings({
          holderId: holding.holderId,
          departmentId: holding.departmentId,
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
      noticeContext.createNotice(
        "Средства связи успешно добавлены и ожидают подтверждения"
      );
      setCreations({ phones: [], holdings: [] });
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

  const getDepartment = useDepartment();
  const getHolder = useHolder();

  // const columns: TableColumn<AddedItem>[] = creations.phones.map((creation) => {
  //   return { ...creation.payload };
  // });

  const phoneModeColumns: TableColumn<AddedItem>[] = [
    {
      key: "id",
      header: "№",
      size: "30px",
      mapper: (v, item, i) => i + 1,
    },
    {
      key: "model",
      header: "Модель",
      mapper: (v, item) => item.item.phoneModelName,
    },
    {
      key: "inventoryKey",
      header: "Инвентарный номер",
      mapper: (v, item) => item.payload.inventoryKey,
    },
    {
      key: "factoryKey",
      header: "Заводской номер",
      mapper: (v, item) => item.payload.factoryKey,
    },
    {
      key: "assemblyDate",
      header: "Год сборки",
      size: "100px",
      mapper: (v, item) => new Date(item.payload.assemblyDate).getFullYear(),
    },
    {
      key: "accountingDate",
      header: "Дата учёта",
      size: "100px",
      mapper: (v, item) =>
        new Date(item.payload.accountingDate).toLocaleDateString(),
    },
    {
      key: "commissioningDate",
      header: "Дата вода в эксплуатацию",
      size: "100px",
      mapper: (v, item) =>
        new Date(item.payload.commissioningDate).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Статус движения",
      // type: "date",
      mapper: (v, item) => {
        const holdingI = creations.holdings.findIndex((h) =>
          h.phoneRandomIds.includes(item.payload.randomId)
        );
        const holding = creations.holdings[holdingI];
        return holding
          ? holding.merge
            ? `Добавление в существующее #${holding.id}`
            : `Новое движение №${holdingI + 1}`
          : "Без движения";
      },
    },
  ];

  const holdingModeColumns: TableColumn<AddedHolding>[] = [
    {
      key: "id",
      header: "№",
      size: "30px",
      mapper: (v, item, i) => i + 1,
    },
    {
      key: "orderKey",
      header: "Номер акта",
      size: "100px",
      mapper: (v, item) => item.orderKey,
    },
    {
      key: "orderDate",
      header: "Дата акта",
      type: "date",
      size: "100px",
      mapper: (v, item) => item.orderDate,
    },
    {
      key: "departmentId",
      header: "Подразделение",
      mapper: (v, item) => getDepartmentName(getDepartment(item.departmentId)),
    },
    {
      key: "holderId",
      header: "Владелец",
      mapper: (v, item) => splitHolderName(getHolder(item.holderId)),
    },
    {
      key: "status",
      header: "Статус движения",
      // type: "date",
      mapper: (v, item) => {
        const phones = creations.phones
          .filter((p) => item.phoneRandomIds.includes(p.payload.randomId))
          .map((p, i) => `№${i + 1}`)
          .join(", ");
        return item.merge ? (
          <>
            Добавление {phones} в существующее{" "}
            <Link inline href={`/holding/view?id=${item.id}`}>
              #{item.id}
            </Link>
          </>
        ) : (
          "Новое движение для " + phones
        );
      },
    },

    // {
    //   key: "factoryKey",
    //   header: "Заводской номер",
    //   mapper: (v, item) => item.payload.factoryKey,
    // },
    // {
    //   key: "assemblyDate",
    //   header: "Год сборки",
    //   mapper: (v, item) => new Date(item.payload.assemblyDate).getFullYear(),
    // },
    // {
    //   key: "accountingDate",
    //   header: "Дата учёта",
    //   // type: "date",
    //   mapper: (v, item) =>
    //     new Date(item.payload.accountingDate).toLocaleDateString(),
    // },
    // {
    //   key: "commissioningDate",
    //   header: "Дата вода в эксплуатацию",
    //   // type: "date",
    //   mapper: (v, item) =>
    //     new Date(item.payload.commissioningDate).toLocaleDateString(),
    // },
  ];

  const holdingMode = search.view === "holding";

  React.useEffect(() => {
    if (!selectedHolding.data) return;
    const holding = selectedHolding.data;
    const ex = creations.holdings.find(
      (h) =>
        h.orderKey === holding.orderKey &&
        new Date(h.orderDate).getFullYear() ===
          new Date(holding.orderDate).getFullYear()
    );
    if (ex)
      return noticeContext.createNotice(
        "Ошибка привязки движения: Движение с соответствующим номером и годом уже присутствует."
      );

    setCreations({
      ...creations,
      holdings: [
        ...creations.holdings,
        {
          merge: true,
          departmentId: holding.departmentId,
          holderId: holding.holderId,
          orderDate: holding.orderDate,
          orderKey: holding.orderKey,
          phoneRandomIds: [],
          id: holding.id,
        },
      ],
    });
  }, [selectedHolding.data?.id]);

  useNotice(phonesStatus);

  return (
    <>
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
        <ModelSelectionPopupContainer
          {...modelPopup}
          onSelect={(id, name) =>
            setBind({ ...bind.input, phoneModelId: id, phoneModelName: name })
          }
        />
      </PopupLayer>
      <TopBarLayer>
        <Checkbox
          disabled
          label={`Без подтверждения`}
          name="no"
          input={{}}
          onChange={(e) => {}}
        />
        <Button
          color="primary"
          disabled={creations.phones.length === 0 || phonesStatus.isLoading}
          onClick={handleCreationsSubmit}
          ref={submitRef}
        >
          Применить
        </Button>
        <Button onClick={handleCreationsClear} ref={submitRef}>
          Очистить
        </Button>
        <Toggle
          inverted
          label={`Отобразить движения (${creations.holdings.length})`}
          name="view"
          input={{ view: holdingMode }}
          onChange={(e) =>
            setSearch({ view: holdingMode ? "phone" : "holding" })
          }
        />
        <Link
          style={{ marginLeft: "auto", marginRight: "0.5rem" }}
          size="sm"
          color="primary"
          onClick={(e) => {
            ref?.click();
            if (ref) ref.value = "";
          }}
        >
          Импорт <Icon.Database color="primary" />
        </Link>
        <Link native size="sm" color="primary" href="/api/import?entity=phone">
          Шаблон <Icon.Download color="primary" />
        </Link>
        <Input
          hidden
          name="file"
          type="file"
          inputProps={{ accept: ".xlsx" }}
          {...bindImport}
        />
      </TopBarLayer>

      <Form
        // style={{ flexFlow: "row" }}
        onSubmit={() => handleSubmit()}
        input={bind.input}
      >
        <Layout flow="row" flex="1" padding="md">
          {/* <Layout> */}
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
            style={{ flex: "1" }}
            name="inventoryKey"
            label="Инвентарный номер"
            placeholder="110xxxxxxxxx"
          />
          <Input
            style={{ flex: "1" }}
            {...bind}
            name="factoryKey"
            placeholder="110xxxxxxxxx"
            label="Заводской номер"
          />
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
            name="accountingDate"
            label="Дата учёта"
            required
          />
          <Input
            {...bind}
            type="date"
            name="commissioningDate"
            label="Дата ввода в эксплуатацию"
            required
          />
        </Layout>
        <Layout
          flow="row"
          flex="1"
          style={{ alignItems: "center", padding: "0 0.75rem" }}
        >
          {selectedHolding?.data ? (
            <>
              <Span inline>
                Привязка к движению{" "}
                <Link
                  inline
                  href={`/holding/view?id=${selectedHolding.data.id}`}
                >
                  #{selectedHolding.data.id}
                </Link>
              </Span>
              <Button inverted color="primary" onClick={onDelHolding}>
                <Icon.X />
              </Button>
            </>
          ) : (
            <Link onClick={() => onAddHolding()}>Привязать к движению</Link>
          )}
          <Button style={{ marginLeft: "auto" }} type="submit">
            Добавить
          </Button>
        </Layout>
      </Form>
      <Hr />
      {holdingMode ? (
        <Table columns={holdingModeColumns} items={creations.holdings} />
      ) : (
        <Table columns={phoneModeColumns} items={creations.phones} />
      )}
    </>
  );
};

export default Create;
