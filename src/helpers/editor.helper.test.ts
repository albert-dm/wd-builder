import { describe, expect, test } from "vitest";
import type { ComponentData, ComponentTree } from "../types/component";
import { componentToJsx, getImports } from "./editor.helper";

const tree: ComponentTree = [
  {
    label: "Layout da Pagina",
    id: "0",
    droppable: true,
    data: {
      componentCollection: "Layout",
      componentName: "Container",
    },
  },
  {
    id: "1",
    parentId: "0",
    label: "Stack",
    droppable: true,
    data: {
      componentCollection: "Layout",
      componentName: "Stack",
      props: {
        align: "start",
      },
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
        label: "Test Button",
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
        label: "Example Button",
      },
    },
  },
];

const rootComponentData: ComponentData = {
  label: "Layout da Pagina",
  id: "0",
  droppable: true,
  data: {
    componentCollection: "Layout",
    componentName: "Container",
  },
};

describe("Editor Helper", () => {
  describe("componentToJsx", () => {
    test("should generate JSX from a simple component without props", () => {
      const simpleTree: ComponentTree = [
        {
          label: "Simple",
          id: "0",
          droppable: true,
          data: {
            componentCollection: "Custom",
            componentName: "Simple",
          },
        },
      ];

      const result = componentToJsx(simpleTree[0], simpleTree);

      expect(result).toContain("<Simple>");
      expect(result).toContain("</Simple>");
    });

    test("should generate JSX with props", () => {
      const componentWithProps: ComponentData = {
        label: "Button",
        id: "1",
        droppable: true,
        data: {
          componentCollection: "Custom",
          componentName: "Button",
          props: {
            label: "Click Me",
          },
        },
      };

      const result = componentToJsx(componentWithProps, [componentWithProps]);

      expect(result).toContain('<Button label="Click Me">');
    });

    test("should generate nested JSX structure", () => {
      const result = componentToJsx(rootComponentData, tree);

      expect(result).toContain("<Container>");
      expect(result).toContain("<Stack");
      expect(result).toContain("<Button");
      expect(result).toContain("</Container>");
    });
  });

  describe("getImports", () => {
    test("should generate require statements from components", () => {
      const result = getImports(tree);

      expect(result).toContain("require('Layout')");
      expect(result).toContain("require('Custom')");
    });

    test("should include unique component names per collection", () => {
      const result = getImports(tree);

      expect(result).toContain("Container");
      expect(result).toContain("Stack");
      expect(result).toContain("Button");
    });

    test("should deduplicate component names", () => {
      const treeWithDuplicates: ComponentTree = [
        {
          label: "Button 1",
          id: "1",
          droppable: true,
          data: {
            componentCollection: "Custom",
            componentName: "Button",
          },
        },
        {
          label: "Button 2",
          id: "2",
          droppable: true,
          data: {
            componentCollection: "Custom",
            componentName: "Button",
          },
        },
      ];

      const result = getImports(treeWithDuplicates);

      const buttonMatches = result.match(/Button/g);
      expect(buttonMatches).toHaveLength(1);
    });
  });
});
