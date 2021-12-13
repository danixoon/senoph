import Header from "components/Header";
import Hr from "components/Hr";
import Layout from "components/Layout";
import Table, { TableColumn } from "components/Table";
import React from "react";

type CommitItem = {
  id: any;
};

type CommitContentProps = {
  columns: TableColumn[];
  items: CommitItem[];
  onCommit: (itemIds: any[], action: CommitActionType) => void;
};

export const CommitContent: React.FC<CommitContentProps> = (props) => {
  const { children, columns, items } = props;
  return (
    <Layout>
      {children}
      <Hr />
      <Header align="right">Элементы ({items.length})</Header>
      <Layout>
        <Table columns={columns} items={items} />
      </Layout>
    </Layout>
  );
};
