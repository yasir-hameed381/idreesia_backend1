exports.paginate = ({ page = 1, size = 25 }) => {
  const parsedPage = Math.max(1, parseInt(page, 10)); // Ensure page is at least 1
  const parsedSize = Math.max(1, parseInt(size, 10)); // Ensure size is at least 1

  return {
    offset: (parsedPage - 1) * parsedSize,
    limit: parsedSize,
    currentPage: parsedPage,
  };
};


/**
 * Build a pagination URL by setting only the 'page' param, preserving rest of query.
 * baseUrl may be e.g. "http://localhost:3000/api/tabarukat?page=1&size=25"
 */
function buildPageUrl(baseUrl, pageNum) {
  if (!baseUrl || typeof baseUrl !== "string") return null;
  try {
    const u = new URL(baseUrl);
    u.searchParams.set("page", String(pageNum));
    return u.toString();
  } catch {
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}page=${pageNum}`;
  }
}

exports.constructPagination = ({ count, limit, offset, currentPage, baseUrl }) => {
  const lastPage = Math.ceil(count / limit);

  const links = {
    first: buildPageUrl(baseUrl, 1),
    last: buildPageUrl(baseUrl, lastPage),
    prev: currentPage > 1 ? buildPageUrl(baseUrl, currentPage - 1) : null,
    next: currentPage < lastPage ? buildPageUrl(baseUrl, currentPage + 1) : null,
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