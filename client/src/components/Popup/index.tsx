import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import { ReactComponent as CrossIcon } from "icons/crossBig.svg";
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import Button from "components/Button";

type PopupProps = OverrideProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    isOpen?: boolean;
    closeable?: boolean;
    size?: "sm" | "md" | "lg";
    onToggle?: (isOpen: boolean) => void;
  }
>;

const Popup: React.FC<PopupProps> = (props: PopupProps) => {
  const { children, isOpen, closeable, onToggle, size = "sm", ...rest } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames("popup__container"),
    },
    rest
  );

  const handleOnToggle = () => {
    if (onToggle) onToggle(!isOpen);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="popup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.06 }}
          className={`popup popup_${size}`}
        >
          <div onClick={handleOnToggle} className="popup__fade" />
          <div {...mergedProps}>
            {closeable && (
              <Button
                color="invisible"
                onClick={handleOnToggle}
                className="popup__close"
                tabIndex={0}
              >
                <CrossIcon />
              </Button>
            )}
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Popup;
