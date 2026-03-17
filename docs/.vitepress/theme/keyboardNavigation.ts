export type DocNavDirection = "prev" | "next";

type ElementLike = {
  tagName?: string;
  isContentEditable?: boolean;
  getAttribute?: (name: string) => string | null;
  parentElement?: ElementLike | null;
  parentNode?: ElementLike | null;
};

type KeyboardEventLike = {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  defaultPrevented?: boolean;
  target?: EventTarget | null;
};

function isEditableElement(value: ElementLike | null | undefined): boolean {
  if (!value) return false;

  const tagName = value.tagName?.toUpperCase();
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }

  if (value.isContentEditable) {
    return true;
  }

  const contentEditable = value.getAttribute?.("contenteditable");
  return contentEditable !== undefined &&
    contentEditable !== null &&
    contentEditable.toLowerCase() !== "false";
}

export function isEditableTarget(target: EventTarget | null | undefined): boolean {
  let current = target as ElementLike | null | undefined;

  while (current) {
    if (isEditableElement(current)) {
      return true;
    }
    current = current.parentElement ?? current.parentNode;
  }

  return false;
}

export function getDocNavDirection(
  event: KeyboardEventLike,
): DocNavDirection | null {
  if (event.defaultPrevented) return null;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return null;
  }
  if (isEditableTarget(event.target)) return null;
  if (event.key === "ArrowLeft") return "prev";
  if (event.key === "ArrowRight") return "next";
  return null;
}
