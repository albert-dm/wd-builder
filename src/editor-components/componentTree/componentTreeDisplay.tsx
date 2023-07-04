import React, { useMemo } from "react";
import { ComponentData, ComponentTree } from "../../types/component.js";
import { ComponentTreeItem } from "./componentTreeItem";
import {
  pointerWithin,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ComponentTreeRoot } from "./componentTreeRoot.js";
import {
  getComponentChildren,
  getComponentDepth,
} from "../../helpers/tree.helper.js";

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
  const depthMap = useMemo(() => {
    return treeData.reduce<{ [compId: string]: number }>((acc, comp) => {
      const newAcc = { ...acc };
      newAcc[comp.id] = getComponentDepth(treeData, comp.id);
      return newAcc;
    }, {});
  }, [treeData]);
  const childrenMap = useMemo(() => {
    return treeData.reduce<{ [compId: string]: ComponentData[] }>(
      (acc, comp) => {
        const newAcc = { ...acc };
        newAcc[comp.id] = getComponentChildren(treeData, comp.id);
        return newAcc;
      },
      {}
    );
  }, [treeData]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    const leftOffset = delta.x;

    if (over && active.id !== over.id) {
      const overParentId = treeData.find(
        (comp) => comp.id === over.id
      )?.parentId;
      const oldIndex = treeData.findIndex((comp) => comp.id === active.id);
      const newIndex = treeData.findIndex((comp) => comp.id === over.id);

      const overChildren = childrenMap[over.id];

      const insertAsChildren = (overChildren.length === 0 && leftOffset >= 50) || (overChildren.length > 0 && leftOffset >= 0);

      const newTreeData = arrayMove(treeData, oldIndex, newIndex + 1);
      setTreeData(
        newTreeData.map((comp) => {
          if (comp.id === active.id) {
            return {
              ...comp,
              parentId: insertAsChildren ? over.id as string : overParentId,
            };
          }
          return comp;
        })
      );
    }
  };

  return (
    <>
      <h3>Component Tree</h3>
      <DndContext
        onDragEnd={handleDragEnd}
        sensors={sensors}
        collisionDetection={pointerWithin}
      >
        <ComponentTreeRoot tree={treeData}>
          {treeData
            .filter((comp) => comp.id !== "0")
            .map((comp) => (
              <ComponentTreeItem
                label={comp.label}
                key={comp.id}
                componentId={comp.id}
                depth={depthMap[comp.id]}
                childrenComponents={childrenMap[comp.id]}
              />
            ))}
        </ComponentTreeRoot>
      </DndContext>
    </>
  );
};
