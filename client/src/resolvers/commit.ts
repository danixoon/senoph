export const statusNames = {
  "create-pending": "Ожидает создания",
  "delete-pending": "Ожидает удаления",
};

export const resolveStatusName = (status?: CommitStatus | null) =>
  typeof status !== "string"
    ? status === null
      ? "Произведено"
      : "Неизвестно"
    : statusNames[status] ?? status;
