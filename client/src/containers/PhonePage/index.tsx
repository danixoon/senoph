import React from "react";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";

import Layout from "components/Layout";
import { Filter, Items } from "layout/PhonePage";

import withSelector from "hoc/withSelector";

import {
  useFetchFilterConfigQuery,
  useFetchPhonesQuery,
} from "store/slices/api";
import { useInput } from "hooks/useInput";
import TopBarLayer from "providers/TopBarLayer";
import Label from "components/Label";
import { useAppSelector } from "store";

type NonNullableObj<T> = {
  [K in keyof T]?: Exclude<T[K], null>;
};

const denullValue = function <T>(obj: T) {
  const parsedFilter: NonNullableObj<T> = {};
  // OMEGALUL typing kostil' for object properties filtering
  for (const k in obj)
    (parsedFilter[k as keyof typeof obj] as any) =
      (obj[k as keyof typeof obj] as any) ?? undefined;

  return parsedFilter;
};

type PhonePageContainerProps = {};

const PhonePageContainer: React.FC<PhonePageContainerProps> = (props) => {
  const { pathname } = useLocation();
  const page = pathname.split("/")[2];

  const bindFilter = useInput<
    Omit<PartialNullable<Required<ApiRequest.FetchPhones>>, "amount" | "offset">
  >(
    {
      search: null,
      modelId: null,
      phoneTypeId: null,
      departmentId: null,
      category: null,
    },
    (key, value, input) => {
      if (key === "phoneTypeId") input.modelId = null;

      return input;
    }
  );
  const bind = useInput({ page: 5 });

  const { data, error, isLoading } = useFetchPhonesQuery({
    ...denullValue(bindFilter.input),
    amount: 50,
    offset: 0,
  });

  const { data: filterData } = useFetchFilterConfigQuery({});

  const { path, url } = useRouteMatch();

  return (
    <Layout flow="row">
      <Layout flex={1}>
        <Switch>
          <Route path={`${path}/view`}>
            <TopBarLayer>
              <Label size="md">Средства связи</Label>
            </TopBarLayer>
            <Items bind={bind} items={data?.items ?? []} />
          </Route>
          <Route path={`${path}/edit`}>
            <TopBarLayer>
              <Label size="md">Управление средствами связи</Label>
            </TopBarLayer>
          </Route>
        </Switch>
      </Layout>
      <Layout style={{ flexBasis: "200px" }}>
        <Filter
          bind={bindFilter}
          config={filterData ?? { types: [], departments: [], models: [] }}
        />
      </Layout>
    </Layout>
  );
};

export default PhonePageContainer;
