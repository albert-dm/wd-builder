// import "./styles.scss";
import type React from "react";
import type { CanvasComponentList, ComponentTree } from "../types/component";
import style from "./canvas.module.css";
import { EditorSidebar } from "./editor-sidebar";
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
      <EditorSidebar
        components={components}
        tree={tree}
        setTree={setTreeData}
      />
      <PreviewArea
        tree={tree}
        setTreeData={setTreeData}
        components={components}
      />
    </section>
  );
};
