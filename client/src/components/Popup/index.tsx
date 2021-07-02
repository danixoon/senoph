import * as React from "react";
import ReactDOM from "react-dom";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";
import { ReactComponent as CrossIcon } from "icons/crossBig.svg";
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import Button from "components/Button";

export type PopupProps = OverrideProps<
  React.HTMLAttributes<HTMLDivElement>,
  {
    isOpen?: boolean;
    closeable?: boolean;
    size?: "sm" | "md" | "lg";
    noPadding?: boolean;
    onToggle?: (isOpen: boolean) => void;
  }
>;

export const PopupContext = React.createContext<null | HTMLElement>(null);
export const PopupTopBar: React.FC<{}> = (props) => {
  const { children } = props;
  return (
    <PopupContext.Consumer>
      {(ref) => ref && ReactDOM.createPortal(children, ref)}
    </PopupContext.Consumer>
  );
};

const Popup: React.FC<PopupProps> = (props: PopupProps) => {
  const {
    children,
    isOpen,
    closeable,
    onToggle,
    noPadding,
    size = "sm",
    ...rest
  } = props;

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        "popup__container",
        `popup__container_${size}`,
        noPadding && "popup_no-padding"
      ),
    },
    rest
  );

  const handleOnToggle = () => {
    if (onToggle) onToggle(!isOpen);
  };

  const [ref, setRef] = React.useState<HTMLDivElement | null>(() => null);
  const topBarRef = React.useCallback((node: HTMLDivElement) => {
    if (node != null) setRef(node);
  }, []);

  return (
    <PopupContext.Provider value={ref}>
      <div className="popup-container">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="popup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.06 }}
              className="popup"
            >
              <div onClick={handleOnToggle} className="popup__fade" />
              <div {...mergedProps}>
                {closeable && (
                  <Button
                    inverted
                    onClick={handleOnToggle}
                    className="popup__close"
                    tabIndex={0}
                  >
                    <CrossIcon />
                  </Button>
                )}
                <div ref={topBarRef} className="popup__header" />
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PopupContext.Provider>
  );
};

export default Popup;
