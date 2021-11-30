import { useFetchConfig } from "hooks/api/useFetchConfig";

export const useHolderName = () => {
  const { departments } = useFetchConfig();

  return (holder?: WithoutId<Api.Models.Holder>, withDepartment?: boolean) => {
    if (!holder) return "Имя не определено";

    const fullName = splitHolderName(holder);
    return fullName.trim();
  };
};
export const splitHolderName = (holder: WithoutId<Api.Models.Holder>) => {
  return `${holder.lastName} ${holder.firstName} ${holder.middleName}`;
};
