import React, { useMemo, useState } from "react";
import {
  CanvasComponentList,
  ComponentData,
  ComponentTree,
} from "../types/component";
import { AddComponentMenu } from "./addComponentMenu";
import { ComponentTreeDisplay } from "./componentTree/componentTreeDisplay";
import { toolbarWrapper, aside } from "./toolbar.style";
import { button } from "../wd-components/button.style";
import { EditionModal } from "./componentEditionModal";

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
  const [showEditionModal, setShowEditionModal] = useState(false);

  const handleComponentAdd = (componentData: ComponentData) => {
    const newComponent: ComponentData = {
      ...componentData,
      parentId: selectedComponentId,
    };
    setTree([...tree, newComponent]);
  };

  const selectedComponentData = useMemo(() => {
    return tree.find((c) => c.id === selectedComponentId);
  }, [selectedComponentId, tree]);

  const selectedComponentMeta = useMemo(() => {
    if (!selectedComponentData) return null;
    return components[selectedComponentData.data.componentCollection][selectedComponentData.data.componentName] || null;
  }, [components, selectedComponentData]);

  const handleChangeComponent = (component: ComponentData) => {
    const newTree = tree.map((c) => {
      if (c.id === component.id) {
        return component;
      }
      return c;
    });
    setTree(newTree);
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
          editComponent={(id) => {
            setSelectedComponentId(id);
            setShowEditionModal(true);
          }}
        />
      </div>
      <EditionModal
        componentData={selectedComponentData!}
        componentSchema={selectedComponentMeta?.zodSchema}
        open={showEditionModal}
        onClose={() => setShowEditionModal(false)}
        setComponent={handleChangeComponent}
        />
    </aside>
  );
};
