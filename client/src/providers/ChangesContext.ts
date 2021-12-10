import { ChangeStatus } from "hooks/api/useChanges";
import React from "react";

type ChangesContextState = {
  changes: any[];
  target: ChangesTargetName;
  targetId: number;
  status: ChangeStatus;
};
const ChangesContext = React.createContext<ChangesContextState | null>(null);

export default ChangesContext;
