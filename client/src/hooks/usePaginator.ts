export const usePaginator = (
  offset: number,
  setOffset: (offset: number) => void,
  total: number,
  perPage: number
) => {
  const maxPage = Math.ceil(total / perPage);
  let currentPage = Math.floor((offset / total) * maxPage) + 1;
  if (Number.isNaN(currentPage)) currentPage = 1;

  if (total > 0 && currentPage > maxPage)
    currentPage = Math.max(1, maxPage - 1);

  const off = (currentPage - 1) * perPage;

  if (offset !== off) setOffset(off);

  return { maxPage, currentPage };
};
