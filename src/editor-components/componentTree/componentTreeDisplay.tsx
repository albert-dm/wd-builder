import React, { useMemo } from "react";
import { ComponentData, ComponentTree } from "../../types/component.js";
import { ComponentTreeItem } from "./componentTreeItem";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { ComponentTreeRoot } from "./componentTreeRoot.js";
import {
  deleteComponentWithChildren,
  getComponentChildren,
  getComponentDepth,
  getOrderedList,
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
  const [collapsedComponents, setCollapsedComponents] = React.useState<
    Set<String>
  >(new Set());
  const [disabledComponents, setDisabledComponents] = React.useState<
    Set<String>
  >(new Set());
  const rootComponent = useMemo(() => treeData.find((comp) => !comp.parentId), [treeData]);

  if (!rootComponent) {
    return <strong>Invalid Tree</strong>;
  }

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

  const handleDeleteComponent = (id: string) => {
    const newTreeData = deleteComponentWithChildren(treeData, id);
    setTreeData(newTreeData);
  };

  const handleToggleCollapseComponent = (id: string) => {
    let allDescendants = new Set<String>();
    let componentChildren = getComponentChildren(treeData, id);
    while (componentChildren.length > 0) {
      allDescendants = new Set([...allDescendants, ...componentChildren.map((comp) => comp.parentId!)]);
      componentChildren = componentChildren.reduce<ComponentData[]>((acc, comp) => {
        return [...acc, ...getComponentChildren(treeData, comp.id)];
      }, []);
    }

    if (collapsedComponents.has(id)) {

      setCollapsedComponents(
        new Set([...collapsedComponents].filter((compId) => !allDescendants.has(compId)))
      );
    } else {
      setCollapsedComponents(new Set([...collapsedComponents, ...allDescendants]));
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    const activeComponent = treeData.find((comp) => comp.id === active.id);

    const [_, ...allDescendants] = getOrderedList(treeData, activeComponent!);

    const allDescendantIds = allDescendants.map((comp) => comp.id);

    setDisabledComponents(new Set(allDescendantIds));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    if (over && active.id !== over.id) {
      const oldIndex = treeData.findIndex((comp) => comp.id === active.id);
      const overIndex = treeData.findIndex((comp) => comp.id === over.id);

      const newParentId =
        delta.x < 40
          ? treeData[overIndex].parentId || (treeData[overIndex].id as string)
          : (treeData[overIndex].id as string);

      if (disabledComponents.has(newParentId)) {
        setDisabledComponents(new Set());
        return;
      }

      const newTreeData = arrayMove(treeData, oldIndex, overIndex + 1);
      const orderedTreeData = getOrderedList(newTreeData.map((comp) => {
        if (comp.id === active.id) {
          return {
            ...comp,
            parentId: newParentId,
          };
        }
        return comp;
      }), rootComponent);

      setTreeData(orderedTreeData);

    }
    setDisabledComponents(new Set());
  };

  return (
    <>
      <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
        <ComponentTreeRoot tree={treeData}>
          {treeData.map((comp) => {
            const isCollapsed = comp.parentId ? collapsedComponents.has(comp.parentId) : false;
            if (isCollapsed) {
              return null;
            }
            return (
              <ComponentTreeItem
                key={comp.id}
                component={comp}
                editComponent={editComponent}
                hasChildren={childrenMap[comp.id].length > 0}
                depth={depthMap[comp.id]}
                selected={selectedComponentId === comp.id}
                selectComponent={() => setSelectedComponentId(comp.id)}
                collapsed={collapsedComponents.has(comp.id)}
                disabled={disabledComponents.has(comp.id)}
                deleteComponent={() => {
                  handleDeleteComponent(comp.id);
                }}
                toggleCollapseComponent={() => {
                  handleToggleCollapseComponent(comp.id);
                }}
              />
            );
          })}
        </ComponentTreeRoot>
      </DndContext>
    </>
  );
};
