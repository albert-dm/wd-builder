import type { ComponentTree } from "@webdrops/wd-builder";
import { Editor } from "@webdrops/wd-builder";
import * as WdComponents from "@webdrops/wd-ui";
import { createRoot } from "react-dom/client";

const initialTree: ComponentTree = [
  {
    label: "Page Layout",
    id: "0",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Page",
    },
  },
  {
    label: "Hero Section",
    id: "hero-section",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Section",
      props: { containerType: "default", pageHeight: true },
    },
    parentId: "0",
  },
  {
    label: "Hero Container",
    id: "hero-container",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Container",
    },
    parentId: "hero-section",
  },
  {
    label: "Hero Stack",
    id: "hero-stack",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Stack",
    },
    parentId: "hero-container",
  },
  {
    label: "Hero Title",
    id: "hero-title",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: { value: "Welcome to Webdrops", type: "h1" },
    },
    parentId: "hero-stack",
  },
  {
    label: "Hero Subtitle",
    id: "hero-subtitle",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Build beautiful websites with ease",
        type: "p",
      },
    },
    parentId: "hero-stack",
  },
  {
    label: "Get Started Button",
    id: "hero-btn",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Button",
      props: { variant: "primary" },
    },
    parentId: "hero-stack",
  },
  {
    label: "Button Text",
    id: "hero-btn-text",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: { value: "Get Started", type: "span" },
    },
    parentId: "hero-btn",
  },
];

const container = document.getElementById("app");
if (!container) {
  throw new Error("Root element #app not found");
}

const root = createRoot(container);
root.render(<Editor initialTree={initialTree} components={{ WdComponents }} />);
