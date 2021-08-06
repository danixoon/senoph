import AltPopup from "components/AltPopup";
import Badge from "components/Badge";
import Button from "components/Button";
import ButtonGroup from "components/ButtonGroup";
import Dropdown from "components/Dropdown";
import Form from "components/Form";
import Header from "components/Header";
import Hr from "components/Hr";
import Icon, { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Label, { LabelProps } from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import LinkItem from "components/LinkItem";
import ListItem, { ListItemProps } from "components/ListItem";
import Popup, { PopupProps, PopupTopBar } from "components/Popup";
import Span from "components/Span";
import Spoiler from "components/Spoiler";
import Switch from "components/Switch";
import Toggle from "components/Toggle";
import LinkItemContainer from "containers/LinkItem";
import { useFilterConfig } from "hooks/api/useFetchConfig";

import { useInput } from "hooks/useInput";
import { useTimeout } from "hooks/useTimeout";
import FieldEditPopup from "layout/FieldEditPopup";
import PhoneEditActions from "layout/PhoneEditActions";
import PopupLayer from "providers/PopupLayer";
import * as React from "react";
import { Edit, Edit2, Edit3 } from "react-feather";

import "./style.styl";

export type AuthPageProps = {
  onLogin: (username: string, password: string) => void;
  status: SplitStatus;
};

const AuthPage: React.FC<AuthPageProps> = (props) => {
  const { onLogin, status } = props;
  const [bind] = useInput({ username: null, password: null });
  const [isMessage, message, setValue] = useTimeout<string | null>(null, 2000);
  const submitRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!status.isError) return;
    const { error } = status;
    setValue(error?.description ?? error?.message ?? "Ошибка");
  }, [status]);

  return (
    <Layout flex="1" className="auth-page">
      <Form>
        <Header hr style={{ marginBottom: "1rem" }} align="center">
          Войдите в аккаунт
        </Header>
        <Input
          {...bind}
          size="lg"
          label="Имя пользователя"
          name="username"
          inputProps={{ type: "username", disabled: status.isLoading }}
        />
        <Input
          {...bind}
          size="lg"
          label="Пароль"
          name="password"
          inputProps={{ type: "password", disabled: status.isLoading }}
        />
        <Button
          disabled={status.isLoading}
          ref={submitRef}
          type="submit"
          color="primary"
          size="md"
          onClick={() => {
            const { username, password } = bind.input;
            onLogin(username ?? "", password ?? "");
          }}
        >
          {status.isLoading ? (
            <LoaderIcon className="loader-icon" fill="#fff" />
          ) : (
            "Войти"
          )}
        </Button>
        <AltPopup
          zIndex="popup"
          position="bottom"
          target={isMessage ? submitRef.current : null}
        >
          {message}
        </AltPopup>
      </Form>
    </Layout>
  );
};

export default AuthPage;
