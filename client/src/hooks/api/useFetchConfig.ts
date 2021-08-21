import * as React from "react";
import { api } from "store/slices/api";

export const useFilterConfig = () => {
  const { data } = api.useFetchFilterConfigQuery({});

  const types = data?.types ?? [];
  const models = data?.models ?? [];
  const departments = data?.departments ?? [];

  return { types, models, departments };
};
