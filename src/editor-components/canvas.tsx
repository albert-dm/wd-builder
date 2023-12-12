// import "./styles.scss";
import React from "react";

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
  const showToolbarState = React.useState(false);
  const [showToolbar, setShowToolbar] = showToolbarState;
  return (
    <section className={style.canvasWrapper}>
      {
        showToolbar && <Toolbar components={components} hideToolbar={() => setShowToolbar(false)} tree={tree} setTree={setTreeData}/>
      }
      <PreviewArea tree={tree} setTreeData={setTreeData} components={components} showToolbarState={showToolbarState}/>
    </section>
  );
};
