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
  stickyTop?: number;
  onCommit: (itemIds: any[], action: CommitActionType) => void;
};

export const CommitContent: React.FC<CommitContentProps> = (props) => {
  const { children, stickyTop, columns, items } = props;
  return (
    <Layout>
      {children}
      <Layout>
        <Table stickyTop={stickyTop} columns={columns} items={items} />
      </Layout>
    </Layout>
  );
};
