export function iconPath(icon) {
  if (!icon) return "/icons/general/tag.svg";

  return `/icons/${icon.includes("/") ? icon : `general/${icon}`}`;
}
