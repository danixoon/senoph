import * as React from "react";
import Layout from "components/Layout";

import "./style.styl";
import TopBarLayer from "providers/TopBarLayer";
import Switch from "components/Switch";
import { useInput } from "hooks/useInput";
import Label from "components/Label";
import Header from "components/Header";
import Span from "components/Span";
import Badge from "components/Badge";
import Hr from "components/Hr";
import { useFetchConfig } from "hooks/api/useFetchConfig";
import ListItem from "components/ListItem";
import Button from "components/Button";
import Icon from "components/Icon";
import ButtonGroup from "components/ButtonGroup";
import { groupBy } from "utils";
import Dropdown from "components/Dropdown";
import Link from "components/Link";
import { splitHolderName, useHolder } from "hooks/misc/holder";
import { usePhoneTypeByModel } from "hooks/misc/phoneType";
import Spoiler from "components/Spoiler";
import { getLastHolding } from "hooks/misc/holding";

export type PhoneCommitPageTab = "create" | "delete" | "edit";
export type PhoneCommitChange = {
  original: Api.Models.Phone;
  changes?: Partial<Api.Models.Phone>;
};

export const getPhonePropertyName = (property: keyof Api.Models.Phone) => {
  const propMap: Partial<{ [K in typeof property]: string }> = {
    id: "Ид.",
    inventoryKey: "Инвентарный номер",
    accountingDate: "Дата принятия к учёту",
    commissioningDate: "Дата ввода в эксплуатацию",
    factoryKey: "Заводской номер",
    assemblyDate: "Год сборки",
  };

  return propMap[property] ?? property;
};

export type PhoneCommitPageProps = {
  tab: PhoneCommitPageTab;
  commits: {
    created: Api.Models.Phone[];
    deleted: Api.Models.Phone[];
    changes: PhoneCommitChange[];
  };
  onCommit: (ids: number[], action: CommitActionType) => void;
  onCommitChanges: (
    target: string,
    targetId: number,
    action: CommitActionType
  ) => void;
};

const CommitItemContent: React.FC<{
  item: Api.Models.Phone;
  getTypeName: (id: number) => string;
  getHolder: (id: number) => Api.Models.Holder | undefined;
}> = (props) => {
  const { item, getTypeName, getHolder } = props;

  return (
    <Layout flow="row">
      <Layout flex="1">
        <ListItem label={getPhonePropertyName("id")}>
          <Span>#{item.id}</Span>
        </ListItem>
        <Hr />
        <ListItem label="Тип">
          <Span>{getTypeName(item.phoneModelId)}</Span>
        </ListItem>
        <Hr />
        <ListItem label="Модель">
          <Span> {item.model?.name}</Span>
        </ListItem>
      </Layout>
      <Hr vertical />
      <Layout flex="2">
        <ListItem label={getPhonePropertyName("assemblyDate")}>
          <Span>{item.assemblyDate}</Span>
        </ListItem>
        <Hr />
        <ListItem label={getPhonePropertyName("commissioningDate")}>
          <Span>{item.commissioningDate}</Span>
        </ListItem>
        <Hr />
        <ListItem label={getPhonePropertyName("accountingDate")}>
          <Span>{item.accountingDate}</Span>
        </ListItem>
      </Layout>
      <Hr vertical />
      <Layout flex="3">
        <ListItem label={getPhonePropertyName("inventoryKey")}>
          <Span>{item.inventoryKey}</Span>
        </ListItem>
        <Hr />
        <ListItem label={getPhonePropertyName("factoryKey")}>
          <Span>{item.factoryKey}</Span>
        </ListItem>
        <Hr />
        <ListItem label="Владелец">
          <Span>
            {splitHolderName(getHolder(getLastHolding(item.holdings).holderId))}
          </Span>
        </ListItem>
      </Layout>
    </Layout>
  );
};

const CommitEditedItemContent: React.FC<{
  item: { original: Api.Models.Phone; changes: Partial<Api.Models.Phone> };
  getTypeName: (id: number) => string;
}> = (props) => {
  const { item, getTypeName } = props;
  const { original, changes } = item;

  const { id, createdAt, ...trueChanges } = changes;

  const changesList = Object.entries(trueChanges).map(([key, v]) => ({
    key,
    value: v,
  }));

  return (
    <Layout flow="row" flex="1">
      <Layout flex="1">
        <ListItem label="Ид.">
          <Span>#{original.id}</Span>
        </ListItem>
        <Hr />
        <ListItem label="Тип">
          <Span>{getTypeName(original.phoneModelId)}</Span>
        </ListItem>
        <Hr />
        <ListItem label="Модель">
          <Span> {item.original.model?.name}</Span>
        </ListItem>
      </Layout>
      <Hr vertical />
      <Layout flex="4">
        {changesList.map(({ key, value }) => (
          <>
            <ListItem label={getPhonePropertyName(key as any)} key={key}>
              <Badge>
                <Icon.Minus size="md" />{" "}
                {original[key as keyof typeof original]}
              </Badge>
              <Badge color="primary">
                <Icon.Plus size="md" /> {value}
              </Badge>
            </ListItem>
            <Hr />
          </>
        ))}
      </Layout>
    </Layout>
  );
};

const PhoneCommitPage: React.FC<PhoneCommitPageProps> = (props) => {
  const { commits, tab, onCommit, onCommitChanges } = props;

  const [bind] = useInput({ author: "me" });

  // const createdCommits: Api.Models.Phone[] = [];
  // const deletedCommits: Api.Models.Phone[] = [];

  // for

  const getTargetCommits = (tab: PhoneCommitPageTab) => {
    switch (tab) {
      case "create":
        return commits.created;
      case "delete":
        return commits.deleted;
      case "edit":
        return commits.changes;
    }
  };

  const { author } = bind.input;

  function isEditCommits(commits: any[]): commits is PhoneCommitChange[] {
    return tab === "edit";
  }

  const targetCommits = getTargetCommits(tab);

  const commitGroup = (
    isEditCommits(targetCommits)
      ? groupBy(targetCommits, (item) => item.changes?.createdAt)
      : groupBy(targetCommits, (item) => item.statusAt)
  ) as Map<any, PhoneCommitChange[] | Api.Models.Phone[]>;

  const [lastDeleted, setLastDeleted] = React.useState<{
    commit: Api.Models.Phone;
    i: number;
  } | null>(() => null);

  const getHolder = useHolder();
  const getTypeName = usePhoneTypeByModel();

  const mapCommits = (
    commits: PhoneCommitChange[] | Api.Models.Phone[],
    cb: (info: {
      commit: Api.Models.Phone;
      header?: string;
      changes?: Partial<Api.Models.Phone>;
      items: PhoneCommitChange[];
      i: number;
    }) => any
  ) => {
    let items: PhoneCommitChange[] = [];
    if (isEditCommits(commits))
      items = commits.filter(
        (commit) => commit.original.id !== lastDeleted?.commit.id
      );
    else
      items = commits
        .filter((commit) => commit.id !== lastDeleted?.commit.id)
        .map((c) => ({ original: c }));

    if (lastDeleted)
      items.splice(lastDeleted.i, 0, {
        original: lastDeleted.commit,
      });

    return items.map((commit, i) => {
      if (commit.original.id === lastDeleted?.commit.id)
        return (
          <Layout padding="md" className="commit-item">
            <Link key={commit.original.id}>Отменить</Link>
          </Layout>
        );

      const isHeader = i === 0;
      const [date, time] = new Date(commit.original.createdAt ?? Date.now())
        .toISOString()
        .split(/[T.]/);

      return cb({
        commit: commit.original,
        changes: commit.changes,
        header: isHeader ? `${items.length} от ${date} в ${time}` : undefined,
        items,
        i,
      });
    });
  };

  const renderCommits = () => {
    const commits = Array.from(commitGroup.entries()).flatMap(
      ([key, commits]) => {
        // return items.map((commit, i) => {
        // return mapCommits(commi)\\
        const mapped = mapCommits(commits, (info) => (
          <CommitItem
            key={info.commit.id}
            // item={{ ...commit, type:  }}
            // TODO: Костыль, сделать красиво
            onCommit={(action) =>
              isEditCommits(commits)
                ? onCommitChanges("phone", info.commit.id, action)
                : onCommit(
                    info.items.map((c) => c.original.id),
                    action
                  )
            }
            header={info.header}
            onCancel={() => {
              if (!isEditCommits(commits))
                onCommit([info.commit.id], "decline");
              else onCommitChanges("phone", info.commit.id, "decline");

              setLastDeleted({ commit: info.commit, i: info.i });
            }}
          >
            {isEditCommits(commits) ? (
              <CommitEditedItemContent
                item={{ original: info.commit, changes: info.changes ?? {} }}
                getTypeName={getTypeName}
              />
            ) : (
              <CommitItemContent
                item={info.commit}
                getTypeName={getTypeName}
                getHolder={getHolder}
              />
            )}
          </CommitItem>
        ));

        return (
          <Spoiler label={`Средства связи (${mapped.length})`}>
            {mapped}
          </Spoiler>
        );
      }
    );

    return commits;
  };

  return (
    <Layout flex="1" className="commit-page">
      <Layout flex="1" className="commit-list">
        {renderCommits()}
      </Layout>
    </Layout>
  );
};

const CommitItem: React.FC<{
  // item: Api.Models.Phone & { type: string };
  onCommit: (action: CommitActionType) => void;
  onCancel: () => void;
  header?: string;
}> = (props) => {
  const { header, onCommit, onCancel, children } = props;

  return (
    <Layout className="commit-item">
      {header ? (
        <Header className="commit-item__header">
          {header}
          <ButtonGroup style={{ marginLeft: "auto" }}>
            <Button color="primary" onClick={() => onCommit("approve")}>
              Подтвердить
              <Icon.Check />
            </Button>
            <Button onClick={() => onCommit("decline")}>
              Отменить
              <Icon.X />
            </Button>
          </ButtonGroup>
        </Header>
      ) : (
        ""
      )}
      <Hr />
      <Layout flow="row">
        <Layout>
          <Button color="primary" inverted onClick={onCancel}>
            <Icon.X />
          </Button>
        </Layout>
        {children}
      </Layout>
      <Hr />
    </Layout>
  );
};

export default PhoneCommitPage;
