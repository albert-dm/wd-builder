import React from "react";
import ReactDOM from "react-dom";

import { Editor } from "./editor";
import { ComponentTree } from "./types/component";

const initialTree: ComponentTree = [
  {
    label: "Layout da Pagina",
    id: "0",
    droppable: false,
    data: {
      componentCollection: "WdComponents",
      componentName: "Page",
    },
  },
  {
    label: "First Section",
    id: "1",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Section",
      props: {
        containerType: "default",
        pageHeight: true,
      },
    },
    parentId: "0",
  },
  {
    label: "Content Row",
    id: "9",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Row",
      props: {
        verticalAlignment: "top",
        horizontalAlignment: "left",
        fullHeight: true,
        gap: 1,
      },
    },
    parentId: "1",
  },
  {
    label: "Text Stack",
    id: "4",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Stack",
    },
    parentId: "9",
  },
  {
    label: "Title",
    id: "3",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Hello World",
        type: "h1",
      },
    },
    parentId: "4",
  },
  {
    label: "Text",
    id: "5",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value:
          "Texto de teste para compreender os limites do texto dessa forma. Provavelmente o ideal seria utilizar algo como o quill aqui para inserir Rich Text, mas por enquanto vamos com texto normal mesmo",
        type: "p",
      },
    },
    parentId: "4",
  },
  // repeating block
  {
    label: "Text Stack",
    id: "6",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Stack",
    },
    parentId: "9",
  },
  {
    label: "Title",
    id: "7",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value: "Hello World",
        type: "h1",
      },
    },
    parentId: "6",
  },
  {
    label: "Icon",
    id: "11",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Icon",
      props: {
        iconName: "MenuIconSVG",
      },
    },
    parentId: "6",
  },
  {
    label: "Text",
    id: "8",
    droppable: true,
    data: {
      componentCollection: "WdComponents",
      componentName: "Text",
      props: {
        value:
          "Texto de teste para compreender os limites do texto dessa forma. Provavelmente o ideal seria utilizar algo como o quill aqui para inserir Rich Text, mas por enquanto vamos com texto normal mesmo",
        type: "p",
      },
    },
    parentId: "6",
  },
];

import { createRoot } from 'react-dom/client';
const container = document.getElementById('app');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<Editor initialTree={initialTree} />);
