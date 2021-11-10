import { useFilterConfig } from "hooks/api/useFetchConfig";

export const useHolderName = () => {
  const { departments } = useFilterConfig();

  return (holder?: WithoutId<Api.Models.Holder>, withDepartment?: boolean) => {
    if (!holder) return "Имя не определено";
    let dep: { id: any; name: string } | null = null;
    if (withDepartment)
      dep = departments.find((dep) => dep.id === holder.departmentId) ?? null;

    return `${holder.lastName} ${holder.firstName} ${holder.middleName} ${
      dep ? `(${dep.name})` : ""
    }`.trim();
  };
};
