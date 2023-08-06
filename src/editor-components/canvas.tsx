// import "./styles.scss";
import React, { RefObject, useEffect, useRef, useState } from "react";

import { Toolbar } from "./toolbar";
import { CanvasComponentList, ComponentTree } from "../types/component";
import style from "./canvas.module.css";
import { PreviewArea } from "./previewArea";

interface CanvasProps {
  tree: ComponentTree;
  setTreeData: (tree: ComponentTree) => void;
  components?: CanvasComponentList;
}

export const Canvas: React.FC<CanvasProps> = ({
  tree,
  setTreeData,
  components = {},
}) => {
  return (
    <section className={style.canvasWrapper}>
      <Toolbar components={components} tree={tree} setTree={setTreeData}/>
      <PreviewArea tree={tree} setTreeData={setTreeData} components={components}/>
    </section>
  );
};
