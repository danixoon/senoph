import * as React from "react";
import { api } from "store/slices/api";

export const useFetchPhoneCommits = (status?: CommitStatus) => {
  const hook = api.useFetchPhonesCommitQuery({ status });
  return hook;
};
