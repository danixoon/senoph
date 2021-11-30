import { useFetchConfig } from "hooks/api/useFetchConfig";

export const useDepartment = () => {
  const { departments } = useFetchConfig();
  return (id?: number) => departments.find((dep) => dep.id === id);
};

export const getDepartmentName = (department?: DB.DepartmentAttributes) => {
  return department?.name ?? "Неизвестное отделение";
};
