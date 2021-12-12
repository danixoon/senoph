export const usePaginator = (
  offset: number,
  total: number,
  perPage: number
) => {
  const maxPage = Math.ceil(total / perPage);
  let currentPage = Math.floor((offset / total) * maxPage) + 1;
  if (Number.isNaN(currentPage)) currentPage = 1;

  if (total > 0 && currentPage > maxPage)
    currentPage = Math.max(1, maxPage - 1);

  const off = (currentPage - 1) * perPage;

  return { maxPage, currentPage, offset: off };
};
