import AltPopup from "components/AltPopup";
import Button from "components/Button";
import Form from "components/Form";
import Header from "components/Header";
import { LoaderIcon } from "components/Icon";
import Input from "components/Input";
import Label from "components/Label";
import Layout from "components/Layout";
import Link from "components/Link";
import Span from "components/Span";

import { useInput } from "hooks/useInput";
import { useTimeout } from "hooks/useTimeout";
import * as React from "react";

import "./style.styl";

export type HoldingPageProps = {};

const HoldingPage: React.FC<HoldingPageProps> = (props) => {
  const {} = props;
  return (
    <Layout flex="1" className="holding-page">
      <Label>
        <Span> Для создания движения выберите </Span>
        <Link href="/phone/edit">средство связи</Link>
      </Label>
    </Layout>
  );
};

export default HoldingPage;
