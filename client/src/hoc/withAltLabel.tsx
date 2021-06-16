import AltPopup from "components/AltPopup";
import * as React from "react";
import PopupLayer from "providers/PopupLayer";

type WithAltLabel = {
  altLabel?: {
    text: string;
    position?: "left" | "right" | "top" | "bottom";
    isOpen?: boolean;
  };
};

export const withAltLabel = function <T>(TargetComponent: React.FC<T>) {
  return (props: T & WithAltLabel) => {
    const [target, setTarget] = React.useState<HTMLElement | null>(() => null);
    const handleMouseEnter = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const target = e.target as HTMLElement;
      setTarget(target ?? null);
    };
    const handleMouseLeave = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      setTarget(null);
    };

    const { altLabel, ...rest } = props;

    return altLabel ? (
      <>
        <TargetComponent
          {...(rest as T)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-label={altLabel?.text ?? undefined}
        />
       
          <AltPopup
            position={altLabel?.position ?? "bottom"}
            target={altLabel ? target : null}
          >
            {altLabel?.text}
          </AltPopup>
        
      </>
    ) : (
      <TargetComponent {...(rest as T)} />
    );
  };
};
