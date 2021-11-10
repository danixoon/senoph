import * as React from "react";
import ReactDOM from "react-dom";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import { ReactComponent as CrossIcon } from "icons/crossBig.svg";
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import Button from "components/Button";
import Layout from "components/Layout";
import Span from "components/Span";

export type NoticeProps = OverrideProps<
  React.HTMLAttributes<HTMLDivElement>,
  {}
>;

const Notice: React.FC<NoticeProps> = (props: NoticeProps) => {
  const { children, ...rest } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames("notice"),
    },
    rest
  );

  return (
    <Layout {...mergedProps}>
      <Span color="white"> {children} </Span>
    </Layout>
  );
};

export default Notice;
