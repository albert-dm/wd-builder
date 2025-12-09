"use client";

import { useState } from "react";
import { WdComponents } from "./";
import style from "./editor.module.css";
import { Canvas } from "./editor-components/canvas";
import type { ComponentTree } from "./types/component";

export type EditorProps = {
  initialTree?: ComponentTree;
};

export const Editor = ({ initialTree }: EditorProps) => {
  const [treeData, setTreeData] = useState(initialTree ?? []);
  return (
    <div className={style.canvasWrapper}>
      <Canvas
        tree={treeData}
        setTreeData={setTreeData}
        components={{
          WdComponents,
          // 'Custom': {
          //   Button,
          // },
          // 'WebDrops': {
          //   Logo,
          //   Header,
          //   Icon,
          // }
        }}
      />
    </div>
  );
};
