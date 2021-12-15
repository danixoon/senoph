import { useFetchConfig } from "hooks/api/useFetchConfig";

export const useAuthor = () => {
  const { users } = useFetchConfig();
  return (id?: number) => users.find((user) => user.id === id);
};

export const getAuthorName = (user?: Api.Models.User) => {
  return user?.name ?? "Неизвестный пользователь";
};
