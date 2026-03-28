"use client";

import { useState } from "react";
import type { CanvasComponentList, ComponentTree } from "../types/component";
import { Canvas } from "./canvas";
import style from "./editor.module.css";

export type EditorProps = {
  initialTree?: ComponentTree;
  components?: CanvasComponentList;
};

export const Editor = ({ initialTree, components = {} }: EditorProps) => {
  const [treeData, setTreeData] = useState(initialTree ?? []);
  return (
    <div className={style.canvasWrapper}>
      <Canvas
        tree={treeData}
        setTreeData={setTreeData}
        components={components}
      />
    </div>
  );
};
