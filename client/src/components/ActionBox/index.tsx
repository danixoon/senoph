import Button from "components/Button";
import Icon, { LoaderIcon } from "components/Icon";
import SpoilerPopup, { SpoilerPopupProps } from "components/SpoilerPopup";
import { withAltLabel } from "hoc/withAltLabel";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

export type ActionBoxProps = {
  status: ApiStatus;
  icon?: React.FC<any>;
  containerProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
} & Omit<SpoilerPopupProps, "target">;
// React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>

const ActionBox: React.FC<ActionBoxProps> = (props) => {
  const { status, icon, children, containerProps, ...rest } = props;
  const [target, setTarget] = React.useState<HTMLElement | null>(() => null);
  const [isOpen, setIsOpen] = React.useState(() => false);

  const IconComponent = icon ?? Icon.Box;

  const popupRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    if (status && !status.isIdle) {
      // if (!status.isLoading) {
      popupRef.current?.focus();
      // }
      return;
    }
    setIsOpen(false);
  }, [status?.status]);

  return (
    <Button
      {...containerProps}
      ref={(r) => setTarget(r)}
      color="primary"
      inverted
      onClick={() => setIsOpen(true)}
    >
      <IconComponent />
      <SpoilerPopup
        ref={popupRef}
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
