import React from "react";
import { useLocation } from "react-router";

import Dropdown from "components/Dropdown";
import Layout from "components/Layout";
import { Filter, Items } from "layout/PhonePage";

import withSelect from "hoc/withSelect";

import { useFetchPhonesQuery } from "store/slices/api";
import { useInput } from "hooks/useInput";

type PhonePageContainerProps = {};

const PhonePageContainer: React.FC<PhonePageContainerProps> = (props) => {
  const { pathname } = useLocation();
  const page = pathname.split("/")[2];

  const { data, error, isLoading } = useFetchPhonesQuery({});

  const bind = useInput({ page: 5 });

  return (
    <Layout flow="row">
      <Layout>
        <Items bind={bind} items={data?.items ?? []} />
      </Layout>
      <Layout>
        <ConnectedFilter />
      </Layout>
    </Layout>
  );
};

const ConnectedFilter = withSelect(Filter, "phone", "filter");

export default PhonePageContainer;
