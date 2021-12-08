import Button from "components/Button";
import Icon, { LoaderIcon } from "components/Icon";
import SpoilerPopup, { SpoilerPopupProps } from "components/SpoilerPopup";
import { withAltLabel } from "hoc/withAltLabel";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

export type ActionBoxProps = {
  status?: ApiStatus;
  icon?: React.FC<any>;
} & Omit<SpoilerPopupProps, "target">;
// React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>

const ActionBox: React.FC<ActionBoxProps> = (props) => {
  const { status, icon, children, ...rest } = props;
  const [target, setTarget] = React.useState<HTMLElement | null>(() => null);
  const [isOpen, setIsOpen] = React.useState(() => false);

  const IconComponent = icon ?? Icon.Box;

  React.useEffect(() => {
    if(!status?.isSuccess) return;
    setIsOpen(false);
  }, [status?.isSuccess])

  return (
    <Button
      ref={(r) => setTarget(r)}
      color="primary"
      inverted
      onClick={() => setIsOpen(true)}
    >
      <IconComponent />
      <SpoilerPopup
        position="right"
        target={isOpen ? target : null}
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as any))
            e.preventDefault();
          else setIsOpen(false);
        }}
        {...rest}
      >
        {status && status.isLoading ? <LoaderIcon /> : children}
      </SpoilerPopup>
    </Button>
  );
};

export default ActionBox;
