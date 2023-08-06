import React, { useMemo } from "react";
import { ComponentData, ComponentTree } from "../../types/component.js";
import { ComponentTreeItem } from "./componentTreeItem";
import {
  DndContext,
  DragEndEvent,
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
  editComponent: (id: string) => void;
}

export const ComponentTreeDisplay: React.FC<ComponentTreeDisplayProps> = ({
  treeData,
  setTreeData,
  selectedComponentId,
  setSelectedComponentId,
  editComponent,
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
    const { active, over, collisions } = event;

    if (over && active.id !== over.id) {
      const oldIndex = treeData.findIndex((comp) => comp.id === active.id);
      const overIndex = treeData.findIndex((comp) => comp.id === over.id);

      const touchingSibling = collisions?.find(item => item.id !== active.id && item.id !== over.id && item.id !== '0');
      const touchingSiblingIndex = treeData.findIndex((comp) => comp.id === touchingSibling?.id);

      const newIndex = touchingSibling ? touchingSiblingIndex : overIndex;

      const newTreeData = arrayMove(treeData, oldIndex, newIndex);
      setTreeData(
        newTreeData.map((comp) => {
          if (comp.id === active.id) {
            return {
              ...comp,
              parentId: over.id as string,
            };
          }
          return comp;
        })
      );
    }
  };

  return (
    <>
      <DndContext
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <ComponentTreeRoot tree={treeData}>
              <ComponentTreeItem
                key={'0'}
                componentId={'0'}
                treeData={treeData}
                editComponent={editComponent}
              />
        </ComponentTreeRoot>
      </DndContext>
    </>
  );
};
