import Header from "components/Header";
import Hr from "components/Hr";
import { LoaderIcon } from "components/Icon";
import Label from "components/Label";
import Layout from "components/Layout";
import React from "react";
import { mergeClassNames } from "utils";
import "./style.styl";

const WithLoader: React.FC<{ status: ApiStatus }> = (props) => {
  const { status, children } = props;
  return (
    <div className="loader-banner">
      {children}
      {status.isLoading && (
        <Layout
          className={mergeClassNames("loader-banner__container")}
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {status.error ? (
            <Layout style={{ alignItems: "center" }}>
              <Header align="center">Ошибка: {status.error.name}</Header>
              <Hr />
              <Label weight="bold" color="primary">
                {status.error.description ?? status.error.message}
              </Label>
            </Layout>
          ) : (
            <LoaderIcon size="md" className="loader-banner__icon" />
          )}
        </Layout>
      )}
    </div>
  );
};

export default WithLoader;
