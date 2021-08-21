import React from "react";

type ChangesContextState = {
  changes: any[];
  target: ChangesTargetName;
  targetId: number;
};
const ChangesContext = React.createContext<ChangesContextState | null>(null);

export default ChangesContext;
