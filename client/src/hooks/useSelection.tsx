import React from "react";

export type Selection = {
  selection: any[];
  total: number;
  onToggleAll: (enable: boolean) => void;
  onToggle: (id: any, enable: boolean) => void;
};

export const useSelection = (items: { id: any }[]) => {
  const [selection, setSelection] = React.useState<number[]>([]);

  React.useEffect(() => {
    const nextSelection = [];
    const ids = new Set<number>(items.map((v) => v.id));
    for (const sel of selection) if (ids.has(sel)) nextSelection.push(sel);

    if (nextSelection.length !== selection.length) setSelection(nextSelection);
  }, [items]);

  const bindSelection: Selection = {
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
