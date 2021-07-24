import AuthPage from "layout/AuthPage";
import React from "react";
import { useAppDispatch, useAppSelector } from "store";
import { login } from "store/slices/app";
import { splitStatus } from "store/utils";

type Props = {};
const AuthPageContainer: React.FC<Props> = (props) => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.app.status);
  const handleOnLogin = (username: string, password: string) => {
    dispatch(login({ password, username }));
  };
  return <AuthPage status={splitStatus(status)} onLogin={handleOnLogin} />;
};

export default AuthPageContainer;