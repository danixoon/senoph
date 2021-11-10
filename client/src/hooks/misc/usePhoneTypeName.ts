import { useFilterConfig } from "hooks/api/useFetchConfig";

export const usePhoneTypeName = () => {
  const { models, types } = useFilterConfig();
  return (modelId: number) => {
    const model = models.find((model) => model.id === modelId);
    const type = model
      ? types.find((type) => model.phoneTypeId === type.id)
      : undefined;

    return type ? type.name : "Неизвестно";
  };
};
