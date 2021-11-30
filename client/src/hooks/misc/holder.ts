import { useFetchConfig } from "hooks/api/useFetchConfig";

export const useHolder = () => {
  const { holders } = useFetchConfig();

  return (id?: number) => holders.find((holder) => holder.id === id);
};
export const splitHolderName = (holder?: WithoutId<Api.Models.Holder>) => {
  return holder
    ? `${holder.lastName} ${holder.firstName} ${holder.middleName}`
    : "Неизвестный владелец";
};

