import Label from "components/Label";
import * as React from "react";
import { mergeClassNames, mergeProps } from "utils";
import "./styles.styl";

import { ReactComponent as ArrowIcon } from "icons/popupArrow.svg";
import { AnimatePresence, motion, HTMLMotionProps } from "framer-motion";
import PopupLayout from "layout/PopupLayout";
import PopupLayer from "providers/PopupLayer";
import { PopupLayerContext } from "providers/PopupLayerProvider";

export type AltPopupProps = OverrideProps<
  React.PropsWithChildren<HTMLMotionProps<"div">>,
  {
    position?: "left" | "right" | "top" | "bottom";
    target: HTMLElement | null;
    zIndex?: "normal" | "popup";
  }
>;

const AltPopup: React.FC<AltPopupProps> = (props: AltPopupProps) => {
  const positions = ["top", "right", "bottom", "left"];
  const { children, target, position = "left", zIndex, ...rest } = props;

  const popupContext = React.useContext(PopupLayerContext);
  const popupZIndex = zIndex ?? popupContext ? "popup" : "normal";

  const inversePosition = (position: AltPopupProps["position"]) => {
    const id = positions.findIndex((p) => p === position);
    return positions[(id + 2) % 4];
  };

  const inversedPos = inversePosition(position);

  const popupRef = React.useRef<HTMLDivElement | null>(null);

  const getPosition = () => {
    let result = {} as React.CSSProperties;

    const width = 120;
    const height = 40;

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
      }
    }
    return result;
  };

  const mergedProps = mergeProps(
    {
      className: mergeClassNames("alt-popup", `alt-popup_z-${popupZIndex}`),
      style: {
        [`margin${inversedPos[0].toUpperCase() + inversedPos.slice(1)}`]: "9px",
        ...getPosition(),
      },
    },
    rest
  );

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
    }
  };

  // const { className, style } = mergedProps;

  // const a = props.;

  return (
    <PopupLayer>
      <AnimatePresence>
        {target && (
          <motion.div
            key="alt-popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            ref={popupRef}
            {...mergedProps}
          >
            <Label weight="medium" className="alt-popup__label">
              {children}
            </Label>
            <ArrowIcon className="alt-popup__icon" style={getArrowStyle()} />
          </motion.div>
        )}
      </AnimatePresence>
    </PopupLayer>
  );
};

export default AltPopup;
