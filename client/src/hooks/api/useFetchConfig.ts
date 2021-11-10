import * as React from "react";
import { api } from "store/slices/api";

export const useFilterConfig = () => {
  const { data: types } = api.useFetchPhoneTypesQuery({});
  const { data: models } = api.useFetchPhoneModelQuery({});
  const { data: departments } = api.useFetchDepartmentsQuery({});

  return {
    types: types?.items ?? [],
    models: models?.items ?? [],
    departments: departments?.items ?? [],
  };
};
