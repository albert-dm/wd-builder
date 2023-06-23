import React, { useState } from "react";
import { CanvasComponentList, ComponentData, ComponentTree } from "../types";
import { AddComponentMenu } from "./addComponentMenu";

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
  const [selectedComponentId, setSelectedComponentId] = useState<
    string | number
  >(0);

  const handleComponentAdd = (componentData: ComponentData) => {
    const newComponent: ComponentData = {
      ...componentData,
      parent: selectedComponentId,
    };
    setTree([...tree, newComponent]);
  };

  return (
    <aside className={className}>
      <AddComponentMenu components={components} onAdd={handleComponentAdd} />
      <button onClick={() => console.log(tree)} >
            Exportar árvore
          </button>
    </aside>
  );
};
