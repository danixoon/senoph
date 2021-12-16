import React from "react";

export type Selection<T = any> = {
  selection: T[];
  total: number;
  onToggleAll: (enable: boolean) => void;
  onToggle: (id: T, enable: boolean) => void;
};

export const useSelection = function <T>(items: { id: T }[]) {
  const [selection, setSelection] = React.useState<T[]>([]);

  React.useEffect(() => {
    const nextSelection = [];
    const ids = new Set<T>(items.map((v) => v.id));
    for (const sel of selection) if (ids.has(sel)) nextSelection.push(sel);

    if (nextSelection.length !== selection.length) setSelection(nextSelection);
  }, [items]);

  const bindSelection: Selection<T> = {
    selection,
    total: items.length,
    onToggleAll: (enable) =>
      enable ? setSelection(items.map((v) => v.id)) : setSelection([]),
    onToggle: (id, enable) =>
      enable
        ? setSelection([...selection, id])
        : setSelection(selection.filter((v) => v !== id)),
  };

  return bindSelection;
};
