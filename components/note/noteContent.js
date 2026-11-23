// Finder læsbar tekst i ældre og nyere formater for noteindhold.
export function getNoteText(content) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => getNoteText(item))
      .filter(Boolean)
      .join("\n");
  }

  if (content && typeof content === "object") {
    return getNoteText(content.text ?? content.content);
  }

  return "";
}

// Omdanner gemt noteindhold til de blokke, noteeditoren arbejder med.
export function getNoteBlocks(content) {
  if (Array.isArray(content)) {
    return content
      .map((block, index) => {
        if (typeof block === "string") {
          return { id: index + 1, type: "paragraph", text: block, checked: false };
        }

        const text = getNoteText(block);
        if (!text && block?.type !== "checklist") {
          return null;
        }

        return {
          id: block.id ?? index + 1,
          type: block.type === "checklist" ? "checklist" : "paragraph",
          text,
          checked: Boolean(block.checked),
          heading: block.heading,
          bold: Boolean(block.bold),
          italic: Boolean(block.italic),
          underline: Boolean(block.underline),
        };
      })
      .filter(Boolean);
  }

  const text = getNoteText(content);
  if (text) {
    return text
      .split("\n")
      .filter((line, index, lines) => line.length > 0 || lines.length === 1)
      .map((line, index) => ({
        id: index + 1,
        type: "paragraph",
        text: line,
        checked: false,
      }));
  }

  return [{ id: 1, type: "paragraph", text: "", checked: false }];
}
