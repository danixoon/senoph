import { useFilterConfig } from "hooks/api/useFetchConfig";

export const useDepartmentName = () => {
  const { departments } = useFilterConfig();
  return (id?: number) => {
    if (id === undefined) return "Неизвестное отделение";

    return (
      departments.find((dep) => dep.id === id)?.name ?? "Неизвестное отделение"
    );
  };
};
