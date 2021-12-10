import { usePrevious } from "hooks/usePrevious";
import * as React from "react";
import { api } from "store/slices/api";
import { useFetchConfig } from "./useFetchConfig";

const makeMap = <K, T extends { id: K }>(list: T[]) => {
  const map = new Map<K, T>();
  for (const item of list) map.set(item.id, item);

  return map;
};

const hasDiffs = <T extends { id: any }>(a: T[], b: T[]) => {
  if (a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id) return true;
  }

  return false;
};

export const useFetchConfigMap = () => {
  const { types, models, departments, holders } = useFetchConfig();

  // const [tp = [], mp = [], dp = [], hp = []] = [
  //   usePrevious(types),
  //   usePrevious(models),
  //   usePrevious(departments),
  //   usePrevious(holders),
  // ];

  // const [typesMap, setTypesMap] = React.useState(
  //   () => new Map<number, Api.Models.PhoneType>()
  // );
  // const [modelsMap, setModelsMap] = React.useState(
  //   () => new Map<number, Api.Models.PhoneModel>()
  // );
  // const [departmentsMap, setDepartmentsMap] = React.useState(
  //   () => new Map<number, Api.Models.Department>()
  // );
  // const [holdersMap, setHoldersMap] = React.useState(
  //   () => new Map<number, Api.Models.Holder>()
  // );

  // TODO: Сделать оптимизированным

  // if (hasDiffs(tp, types)) setTypesMap(makeMap(types));
  // if (hasDiffs(mp, models)) setModelsMap(makeMap(models));
  // if (hasDiffs(dp, departments)) setDepartmentsMap(makeMap(departments));
  // if (hasDiffs(hp, holders)) setHoldersMap(makeMap(holders));

  return {
    types: makeMap<number, Api.Models.PhoneType>(types),
    models: makeMap<number, Api.Models.PhoneModel>(models),
    departments: makeMap<number, Api.Models.Department>(departments),
    holders: makeMap<number, Api.Models.Holder>(holders),
  };
};
