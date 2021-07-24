import Header from "components/Header";
import Hr from "components/Hr";
import { LoaderIcon } from "components/Icon";
import Label from "components/Label";
import Layout from "components/Layout";
import React from "react";

const WithLoader: React.FC<{ isLoading?: boolean; error?: Api.Error }> = (
  props
) => {
  const { isLoading, error, children } = props;
  return isLoading || error ? (
    <Layout
      style={{
        justifyContent: "center",
        alignItems: "center",
        height: "50vh",
      }}
    >
      {error ? (
        <Layout style={{ alignItems: "center" }}>
          <Header align="center">Ошибка: {error.name}</Header>
          <Hr />
          <Label weight="bold" color="primary">
            {error.description ?? error.message}
          </Label>
        </Layout>
      ) : (
        <LoaderIcon />
      )}
    </Layout>
  ) : (
    <> {children} </>
  );
};

export default WithLoader;
