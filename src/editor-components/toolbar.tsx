import React, { useState } from "react";
import {
  CanvasComponentList,
  ComponentData,
  ComponentTree,
} from "../types/component";
import { AddComponentMenu } from "./addComponentMenu";
import { ComponentTreeDisplay } from "./componentTree/componentTreeDisplay";
import { toolbarWrapper, aside } from "./toolbar.style";
import { button } from "./button.style";

interface ToolbarProps {
  components: CanvasComponentList;
  tree: ComponentTree;
  setTree: (tree: ComponentTree) => void;
  className?: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  components,
  tree,
  setTree,
  className,
}) => {
  const [selectedComponentId, setSelectedComponentId] = useState<string>("0");

  const handleComponentAdd = (componentData: ComponentData) => {
    const newComponent: ComponentData = {
      ...componentData,
      parent: selectedComponentId,
    };
    setTree([...tree, newComponent]);
  };

  return (
    <aside className={className} style={aside}>
      <div style={toolbarWrapper()}>
        <AddComponentMenu components={components} onAdd={handleComponentAdd} />
        <button style={button('primary')} name="export-tree" onClick={() => console.log(tree)}>
          Export Tree
        </button>
        <ComponentTreeDisplay
          treeData={tree}
          setTreeData={setTree}
          selectedComponentId={selectedComponentId}
          setSelectedComponentId={setSelectedComponentId}
        />
      </div>
    </aside>
  );
};
