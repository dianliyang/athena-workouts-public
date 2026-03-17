import { describe, expect, test } from "vitest";
import {
  getDocNavDirection,
  isEditableTarget,
} from "../../docs/.vitepress/theme/keyboardNavigation";

function element(
  tagName: string,
  options: {
    contenteditable?: string | null;
    isContentEditable?: boolean;
    parent?: any;
  } = {},
) {
  return {
    tagName,
    isContentEditable: options.isContentEditable ?? false,
    parentElement: options.parent ?? null,
    parentNode: options.parent ?? null,
    getAttribute(name: string) {
      if (name !== "contenteditable") return null;
      return options.contenteditable ?? null;
    },
  };
}

describe("keyboard navigation guards", () => {
  test("detects editable targets and editable ancestors", () => {
    const input = element("input");
    const childOfEditable = element("span", {
      parent: element("div", { contenteditable: "true" }),
    });

    expect(isEditableTarget(input as EventTarget)).toBe(true);
    expect(isEditableTarget(childOfEditable as EventTarget)).toBe(true);
    expect(isEditableTarget(element("button") as EventTarget)).toBe(false);
  });

  test("handles only bare left and right arrows outside editable elements", () => {
    expect(
      getDocNavDirection({
        key: "ArrowLeft",
        target: element("div") as EventTarget,
      }),
    ).toBe("prev");
    expect(
      getDocNavDirection({
        key: "ArrowRight",
        target: element("div") as EventTarget,
      }),
    ).toBe("next");
    expect(
      getDocNavDirection({
        key: "ArrowRight",
        ctrlKey: true,
        target: element("div") as EventTarget,
      }),
    ).toBeNull();
    expect(
      getDocNavDirection({
        key: "ArrowLeft",
        target: element("textarea") as EventTarget,
      }),
    ).toBeNull();
  });
});
