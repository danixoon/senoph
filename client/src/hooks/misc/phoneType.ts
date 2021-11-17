import { useFilterConfig } from "hooks/api/useFetchConfig";

export const usePhoneTypeByModel = () => {
  const { models, types } = useFilterConfig();
  return (modelId: number) => {
    const model = models.find((model) => model.id === modelId);
    const type = model
      ? types.find((type) => model.phoneTypeId === type.id)
      : undefined;

    return type ? type.name : "Неизвестно";
  };
};

export const usePhoneType = () => {
  const { models, types } = useFilterConfig();
  return (phoneTypeId: number) => {
    const type = types.find((type) => type.id === phoneTypeId);

    return type ? type.name : "Неизвестно";
  };
};
