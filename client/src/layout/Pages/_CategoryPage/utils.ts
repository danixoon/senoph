export const categoryNames = {
  "1": "I (Прибыло, на гарантии)",
  "2": "II (Нет гарантии, исправно)",
  "3": "III (Неисправно)",
  "4": "IV (Подлежит списанию)",
};

export const resolveCategoryName = (category?: CategoryKey) =>
  typeof category !== "string"
    ? "Неизвестно"
    : categoryNames[category] ?? `Категория ${category}`;
