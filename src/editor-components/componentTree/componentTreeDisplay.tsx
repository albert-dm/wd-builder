import React from "react";
import { ComponentTree } from "../../types/component.js";
import { MouseEvent } from "react";
import { ComponentTreeItem } from "./componentTreeItem";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

function arraymove(arr: Array<any>, fromIndex: number, toIndex: number) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

interface ComponentTreeDisplayProps {
  treeData: ComponentTree;
  setTreeData: (tree: ComponentTree) => void;
  selectedComponentId: string;
  setSelectedComponentId: (id: string) => void;
}

export const ComponentTreeDisplay: React.FC<ComponentTreeDisplayProps> = ({
  treeData,
  setTreeData,
  selectedComponentId,
  setSelectedComponentId,
}) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (!over || over.id === active.id) {
      return;
    }
    const newTree = treeData.map((c) => {
      if (c.id === active.id) {
        return {
          ...c,
          parent: over.id as string,
        };
      }
      return c;
    });

    const touchingSibling = event.collisions?.find(item => item.id !== active.id && item.id !== over.id && item.id !== '0');

    if (touchingSibling) {
      const activeIndex = newTree.findIndex((c) => c.id === active.id);
      const touchingSiblingIndex = newTree.findIndex((c) => c.id === touchingSibling.id);
      arraymove(newTree, activeIndex, touchingSiblingIndex);
    }

    console.info({ endEvent: event, touchingSibling });

    setTreeData(newTree);
  };

  const handleSelectComponent = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedComponentId(id);
  };
  const handleSelectRootComponent = () => {
    setSelectedComponentId("0");
  };
  return (
    <>
    <h3>Component Tree</h3>
    <DndContext onDragEnd={handleDragEnd}>
      <ComponentTreeItem componentId={"0"} treeData={treeData} />
    </DndContext>
    </>
  );
};
