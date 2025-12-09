import { describe, expect, test } from "vitest";
import type { ComponentData, ComponentTree } from "../types/component";
import {
  deleteComponentWithChildren,
  getComponentChildren,
  getComponentDepth,
  getOrderedList,
} from "./tree.helper";

const tree: ComponentTree = [
  {
    label: "Layout da Pagina",
    id: "0",
    droppable: true,
    data: {
      componentCollection: "Layout",
      componentName: "Section",
    },
  },
  {
    id: "1",
    parentId: "0",
    label: "Stack",
    droppable: true,
    data: {
      componentCollection: "Layout",
      componentName: "Article",
    },
  },
  {
    id: "2",
    parentId: "1",
    label: "First Button",
    droppable: true,
    data: {
      componentCollection: "Custom",
      componentName: "Button",
      props: {
        label: "First Button",
      },
    },
  },
  {
    id: "3",
    parentId: "1",
    label: "Second Button",
    droppable: true,
    data: {
      componentCollection: "Custom",
      componentName: "Button",
      props: {
        label: "Second Button",
      },
    },
  },
  {
    id: "4",
    parentId: "1",
    label: "Third Button",
    droppable: true,
    data: {
      componentCollection: "Custom",
      componentName: "Button",
      props: {
        label: "Third Button",
      },
    },
  },
];

describe("Tree Helper", () => {
  describe("getComponentChildren", () => {
    test("should return direct children of a component", () => {
      const children = getComponentChildren(tree, "1");

      expect(children).toHaveLength(3);
      expect(children.map((c) => c.id)).toEqual(["2", "3", "4"]);
    });

    test("should return empty array for component with no children", () => {
      const children = getComponentChildren(tree, "2");

      expect(children).toHaveLength(0);
    });

    test("should return children of root component", () => {
      const children = getComponentChildren(tree, "0");

      expect(children).toHaveLength(1);
      expect(children[0].id).toBe("1");
    });
  });

  describe("getComponentDepth", () => {
    test("should return 0 for root component", () => {
      const depth = getComponentDepth(tree, "0");

      expect(depth).toBe(0);
    });

    test("should return 1 for first level children", () => {
      const depth = getComponentDepth(tree, "1");

      expect(depth).toBe(1);
    });

    test("should return 2 for second level children", () => {
      const depth = getComponentDepth(tree, "2");

      expect(depth).toBe(2);
    });
  });

  describe("getOrderedList", () => {
    test("should return components in tree order", () => {
      const rootComponent = tree[0];
      const orderedList = getOrderedList(tree, rootComponent);

      expect(orderedList[0].id).toBe("0");
      expect(orderedList[1].id).toBe("1");
    });

    test("should include all descendants", () => {
      const rootComponent = tree[0];
      const orderedList = getOrderedList(tree, rootComponent);

      expect(orderedList).toHaveLength(5);
    });

    test("should return single component if no children", () => {
      const leafComponent: ComponentData = tree[2];
      const orderedList = getOrderedList(tree, leafComponent);

      expect(orderedList).toHaveLength(1);
      expect(orderedList[0].id).toBe("2");
    });
  });

  describe("deleteComponentWithChildren", () => {
    test("should delete a leaf component", () => {
      const result = deleteComponentWithChildren([...tree], "4");

      expect(result).toHaveLength(4);
      expect(result.find((c) => c.id === "4")).toBeUndefined();
    });

    test("should delete component and all its children", () => {
      const result = deleteComponentWithChildren([...tree], "1");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("0");
    });

    test("should not affect siblings when deleting", () => {
      const result = deleteComponentWithChildren([...tree], "2");

      expect(result).toHaveLength(4);
      expect(result.find((c) => c.id === "3")).toBeDefined();
      expect(result.find((c) => c.id === "4")).toBeDefined();
    });
  });
});
