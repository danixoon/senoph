import * as React from "react";
import { useFetchFilterConfigQuery } from "store/slices/api";

export const useFilterConfig = () => {
  const { data } = useFetchFilterConfigQuery({});

  const types = data?.types ?? [];
  const models = data?.models ?? [];
  const departments = data?.departments ?? [];

  return { types, models, departments };
};
