export default function getNotePreview(content) {
  if (Array.isArray(content)) {
    return content
      .map((block) => (block && typeof block.text === "string"
        ? block.text.replace(/^-\s*\[[ xX]\]\s*/, "")
        : ""))
      .join("\n");
  }

  if (typeof content !== "string") {
    if (content && typeof content.text === "string") return content.text;
    return "";
  }
  if (!content.startsWith("[")) return content;

  try {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) return "";
    return parsed
      .map((block) => typeof block?.text === "string" ? block.text : "")
      .join("\n");
  } catch {
    return content;
  }
}
