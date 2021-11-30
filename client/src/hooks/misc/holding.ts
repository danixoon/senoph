export const getLastHolding = (
  holdings: WithoutId<DB.HoldingAttributes>[] = []
) => {
  return [...holdings].sort((h1, h2) =>
    h1.orderDate > h2.orderDate ? -1 : 1
  )[0];
};
