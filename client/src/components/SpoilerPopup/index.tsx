import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

import { ReactComponent as ArrowIcon } from "icons/popupArrow.svg";
import {
  AnimatePresence,
  motion,
  HTMLMotionProps,
  useMotionValue,
} from "framer-motion";
import PopupLayout from "layout/PopupLayout";
import PopupLayer from "providers/PopupLayer";
import { PopupLayerContext } from "providers/PopupLayerProvider";
import Button from "components/Button";
import Layout from "components/Layout";

export type SpoilerPopupProps = OverrideProps<
  React.PropsWithChildren<HTMLMotionProps<"div">>,
  {
    position?: "left" | "right" | "top" | "bottom" | "rt-corner";
    target: HTMLElement | null;
    zIndex?: "normal" | "popup";
  }
>;

const SpoilerPopup: React.FC<SpoilerPopupProps> = (
  props: SpoilerPopupProps
) => {
  const positions = ["top", "right", "bottom", "left"];
  const { children, target, position = "left", zIndex, ...rest } = props;

  const popupContext = React.useContext(PopupLayerContext);
  const popupZIndex = zIndex ?? popupContext ? "popup" : "normal";

  const inversePosition = (position: SpoilerPopupProps["position"]) => {
    const id = positions.findIndex((p) => p === position);
    return positions[(id + 2) % 4];
  };

  const inversedPos = inversePosition(position);

  const popupRef = React.useRef<HTMLDivElement | null>(null);

  const layoutRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (target) layoutRef.current?.focus();
  }, [target]);

  // const getPositionNumbers = () => {

  // }

  const getPosition = () => {
    let result = {} as React.CSSProperties;

    const width = layoutRef.current?.offsetWidth ?? 120;
    const height = layoutRef.current?.offsetHeight ?? 40;

    if (target) {
      const rect = target.getBoundingClientRect();

      const centerX = rect.x + rect.width / 2 - width / 2 - 10;
      const centerY = rect.y + rect.height / 2 - height / 2 - 4;
      switch (position) {
        case "top":
          result.left = centerX;
          result.top = rect.y - height - 16;
          break;
        case "bottom":
          result.left = centerX;
          result.top = rect.y + rect.height;
          break;
        case "left":
          result.left = rect.x - width - 27;
          result.top = centerY;
          break;
        case "right":
          result.left = rect.x + rect.width;
          result.top = centerY;
          break;
        case "rt-corner":
          result.left = rect.x - width - 27;
          result.top = rect.y + rect.height - 25;
          break;
      }
    }
    return result;
  };

  const pos = getPosition();
  const [left, top, right, bottom] = [
    useMotionValue(pos.left),
    useMotionValue(pos.top),
    useMotionValue(pos.right),
    useMotionValue(pos.bottom),
  ];

  const setStyle = () => {
    // const [left, top, right, bottom] = style;
    const pos = getPosition();
    left.set(pos.left);
    top.set(pos.top);
    right.set(pos.right);
    bottom.set(pos.bottom);
  };

  const mergedProps = mergeProps(
    {
      className: mergeClassNames(
        "spoiler-popup",
        `spoiler-popup_z-${popupZIndex}`
      ),
      style: {
        [`margin${inversedPos[0].toUpperCase() + inversedPos.slice(1)}`]: "9px",
      } as any,
    },
    rest
  );

  // style.

  React.useEffect(() => {
    let exit = false;
    const request = () =>
      window.requestAnimationFrame(() => {
        if (!exit) setStyle();
        request();
      });
    request();

    return () => {
      exit = true;
    };
  });

  // React.useEffect(() => {
  //   window.requestAnimationFrame(() => {

  //   });
  // });

  const getArrowStyle = () => {
    switch (position) {
      case "top":
        return {
          [position]: "calc(100% - 1px)",
          left: "calc(50% - 2px)",
          transform: `rotate(${0}deg)`,
        };
      case "bottom":
        return {
          [position]: "calc(100% - 1px)",
          left: "calc(50% - 2px)",
          transform: `rotate(${180}deg)`,
        };
      case "left":
        return {
          [position]: "calc(100% - 3px)",
          bottom: "calc(50% - 2px)",
          transform: `rotate(${-90}deg)`,
        };
      case "right":
        return {
          [position]: "calc(100% - 3px)",
          bottom: "calc(50% - 2px)",
          transform: `rotate(${90}deg)`,
        };
      case "rt-corner":
        return {
          bottom: "calc(100% - 17px)",
          left: "calc(100% - 2px)",
          transform: `rotate(${-90}deg)`,
        };
    }
  };

  // const { className, style } = mergedProps;

  // const a = props.;

  return (
    <PopupLayer>
      <AnimatePresence>
        {target && (
          <motion.div
            key="spoiler-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            ref={popupRef}
            {...{
              ...mergedProps,
              style: { ...mergedProps.style, left, top, right, bottom },
            }}
          >
            <Layout
              tabIndex={0}
              className="spoiler-popup__content"
              ref={(r) => (layoutRef.current = r)}
            >
              {children}
            </Layout>
            <ArrowIcon
              className="spoiler-popup__icon"
              style={getArrowStyle()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </PopupLayer>
  );
};

export const SpoilerPopupButton: React.FC<
  OverrideProps<React.HTMLAttributes<HTMLButtonElement>, {}>
> = (props) => {
  const { children, ...rest } = props;

  const mergedProps = mergeProps({ className: "spoiler-popup__button" }, rest);

  return <button {...mergedProps}>{children}</button>;
};

export default SpoilerPopup;
