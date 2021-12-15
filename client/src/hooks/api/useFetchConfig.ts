import * as React from "react";
import { api } from "store/slices/api";

export const useFetchConfig = () => {
  const { data: types } = api.useFetchPhoneTypesQuery({});
  const { data: models } = api.useFetchPhoneModelQuery({});
  const { data: departments } = api.useFetchDepartmentsQuery({});
  const { data: holders } = api.useFetchHoldersQuery({});
  const { data: users } = api.useFetchUsersQuery({});

  return {
    types: types?.items ?? [],
    models: models?.items ?? [],
    departments: departments?.items ?? [],
    holders: holders?.items ?? [],
    users: users?.items ?? [],
  };
};
