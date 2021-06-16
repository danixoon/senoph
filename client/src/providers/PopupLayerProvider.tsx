import * as React from "react";
import PopupLayout from "layout/PopupLayout";

export const PopupLayerContext = React.createContext<HTMLElement | null>(null);

export interface PopupLayerProviderProps {}

const PopupLayerProvider: React.FC<React.PropsWithChildren<
  PopupLayerProviderProps
>> = ({ children }) => {
  const layoutRef = React.useRef<HTMLElement | null>(null);
  const [layoutElement, setLayoutElement] = React.useState<HTMLElement | null>(
    () => layoutRef.current
  );

  return (
    <PopupLayerContext.Provider value={layoutElement}>
      {children}
      <PopupLayout ref={(ref) => setLayoutElement(ref)} />
    </PopupLayerContext.Provider>
  );
};

export default PopupLayerProvider;
