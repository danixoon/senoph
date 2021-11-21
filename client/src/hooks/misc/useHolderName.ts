import { useFetchConfig } from "hooks/api/useFetchConfig";

export const useHolderName = () => {
  const { departments } = useFetchConfig();

  return (holder?: WithoutId<Api.Models.Holder>, withDepartment?: boolean) => {
    if (!holder) return "Имя не определено";
    let dep: { id: any; name: string } | null = null;
    if (withDepartment)
      dep = departments.find((dep) => dep.id === holder.departmentId) ?? null;

    const fullName = splitHolderName(holder);
    return `${fullName}${dep ? ` (${dep.name})` : ""}`.trim();
  };
};
export const splitHolderName = (holder: WithoutId<Api.Models.Holder>) => {
  return `${holder.lastName} ${holder.firstName} ${holder.middleName}`;
};
