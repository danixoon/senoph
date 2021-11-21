import { useFetchConfig } from "hooks/api/useFetchConfig";

export const useDepartmentName = () => {
  const { departments } = useFetchConfig();
  return (id?: number) => {
    if (id === undefined) return "Неизвестное отделение";

    return (
      departments.find((dep) => dep.id === id)?.name ?? "Неизвестное отделение"
    );
  };
};
