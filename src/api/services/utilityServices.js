exports.paginate = ({ page = 1, size = 25 }) => {
  const parsedPage = Math.max(1, parseInt(page, 10)); // Ensure page is at least 1
  const parsedSize = Math.max(1, parseInt(size, 10)); // Ensure size is at least 1

  return {
    offset: (parsedPage - 1) * parsedSize,
    limit: parsedSize,
    currentPage: parsedPage,
  };
};


exports.constructPagination = ({ count, limit, offset, currentPage, baseUrl }) => {
  const lastPage = Math.ceil(count / limit);

  const links = {
    first: `${baseUrl}?page=1`,
    last: `${baseUrl}?page=${lastPage}`,
    prev: currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : null,
    next: currentPage < lastPage ? `${baseUrl}?page=${currentPage + 1}` : null,
  };

  const meta = {
    current_page: currentPage,
    from: offset + 1,
    last_page: lastPage,
    path: baseUrl,
    per_page: limit.toString(),
    to: Math.min(offset + limit, count),
    total: count,
  };

  return { links, meta };
};