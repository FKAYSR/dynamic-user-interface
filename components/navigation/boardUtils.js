function getLastAccessedTimestamp(board) {
  const timestamp = Date.parse(board.last_accessed_at || "");
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function sortBoardsByLastAccessed(boards) {
  return [...boards].sort((first, second) => {
    const firstAccessed = getLastAccessedTimestamp(first);
    const secondAccessed = getLastAccessedTimestamp(second);

    if (firstAccessed === null) return secondAccessed === null ? 0 : 1;
    if (secondAccessed === null) return -1;
    return secondAccessed - firstAccessed;
  });
}

export function getBoardSlug(name) {
  return name.trim().replace(/\s+/g, "-");
}

export function getBoardHref(board) {
  return `/boards/${encodeURIComponent(getBoardSlug(board.name))}?id=${encodeURIComponent(board.id)}`;
}
