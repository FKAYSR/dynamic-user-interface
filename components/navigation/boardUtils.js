// Læser tavlens seneste besøgstidspunkt, eller null hvis det ikke findes.
function getLastAccessedTimestamp(board) {
  const timestamp = Date.parse(board.last_accessed_at || "");
  return Number.isNaN(timestamp) ? null : timestamp;
}

// Sorterer tavler efter seneste besøg uden at ændre den oprindelige liste.
export function sortBoardsByLastAccessed(boards) {
  return [...boards].sort((first, second) => {
    const firstAccessed = getLastAccessedTimestamp(first);
    const secondAccessed = getLastAccessedTimestamp(second);

    if (firstAccessed === null) return secondAccessed === null ? 0 : 1;
    if (secondAccessed === null) return -1;
    return secondAccessed - firstAccessed;
  });
}

// Laver et tavlenavn om til den del af URL'en, der kan læses som en sti.
export function getBoardSlug(name) {
  return name.trim().replace(/\s+/g, "-");
}

// Bygger tavlens URL med både navn og id, så ens navne ikke bliver tvetydige.
export function getBoardHref(board) {
  return `/boards/${encodeURIComponent(getBoardSlug(board.name))}?id=${encodeURIComponent(board.id)}`;
}
