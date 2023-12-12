import React, { useMemo, useState } from "react";
import {
  CanvasComponentList,
  ComponentData,
  ComponentTree,
} from "../../types/component";
import { AddComponentMenu } from "../addComponentMenu";
import { ComponentTreeDisplay } from "../componentTree/componentTreeDisplay";
import { EditionModal } from "../componentEditionModal";
import * as Portal from "@radix-ui/react-portal";

import style from "./toolbar.module.css";
import buttonStyle from "../../wd-components/button/button.module.css";
import { Handle } from "./handle";

interface ToolbarProps {
  components: CanvasComponentList;
  tree: ComponentTree;
  setTree: (tree: ComponentTree) => void;
  className?: string;
  hideToolbar: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  components,
  tree,
  setTree,
  className,
  hideToolbar
}) => {
  const [selectedComponentId, setSelectedComponentId] = useState<string>("0");
  const [showEditionModal, setShowEditionModal] = useState(false);
  const [postion, setPosition] = useState({ left: 200, top: 200 });

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
    return (
      components[selectedComponentData.data.componentCollection][
        selectedComponentData.data.componentName
      ] || null
    );
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
    <Portal.Root>
      <div
        className={`${className || ""} ${style.toolbarWrapper}`}
        style={{
          left: postion.left,
          top: postion.top,
        }}
      >
        <Handle setPosition={(left, top) => setPosition({ left, top })} />
        <AddComponentMenu components={components} onAdd={handleComponentAdd} />
        <button
          className={buttonStyle.buttonWrapper}
          name="export-tree"
          onClick={() => console.log(tree)}
        >
          Export Tree
        </button>
        <button
          className={buttonStyle.buttonWrapper}
          name="export-tree"
          onClick={() => hideToolbar()}
        >
          X
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
      {showEditionModal && <EditionModal
        componentData={selectedComponentData!}
        componentSchema={selectedComponentMeta?.zodSchema}
        open={showEditionModal}
        onClose={() => setShowEditionModal(false)}
        setComponent={handleChangeComponent}
      />}
    </Portal.Root>
  );
};
