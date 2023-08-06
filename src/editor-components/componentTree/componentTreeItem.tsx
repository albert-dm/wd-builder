import React, { CSSProperties, useMemo } from "react";
import { ComponentData, ComponentTree } from "../../types/component";
import { useSortable } from "@dnd-kit/sortable";
import {
  MinusCircledIcon,
  PlusCircledIcon,
  Pencil2Icon,
  DotFilledIcon,
} from "@radix-ui/react-icons";
import { getComponentChildren } from "../../helpers/tree.helper";
import { useDroppable } from "@dnd-kit/core";
import style from "./componentTreeItem.module.css";

const itemIcons = {
  open: <MinusCircledIcon width={18} height={18} />,
  closed: <PlusCircledIcon width={18} height={18} />,
  noChildren: <DotFilledIcon width={18} height={18} />,
};
interface ComponentTreeItemProps {
  componentId: ComponentData["id"];
  treeData: ComponentTree;
  editComponent: (id: string) => void;
}

export const ComponentTreeItem: React.FC<ComponentTreeItemProps> = ({
  componentId,
  treeData,
  editComponent,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    isDragging,
    transform,
    isOver,
    transition,
    active,
  } = useSortable({ id: componentId.toString() });

  const { isOver: isOverDroppable, setNodeRef: setDroppableRef } = useDroppable(
    {
      id: componentId.toString(),
    }
  );

  const itemStyle = {
    transform:
      transform && isDragging
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    transition,
  };

  const { label } = useMemo(() => {
    return treeData.find((comp) => comp.id === componentId)!;
  }, [treeData, componentId]);

  const componentChildren = useMemo(() => {
    return getComponentChildren(treeData, componentId);
  }, [treeData, componentId]);

  const isRoot = componentId === "0";

  return (
    <div ref={setSortableRef}>
      <div style={itemStyle} className={style.treeItemWrapper} data-dragging={isDragging}>
        <section className={style.treeItemSection}>
          <button
            onClick={() => {
              setCollapsed(!collapsed);
            }}
          >
            {componentChildren.length > 0
              ? itemIcons.open
              : itemIcons.noChildren}
          </button>

          {!isRoot ? (
          <header {...listeners} {...attributes} style={{ flex: 1 }}>
            {label}
          </header>
            ) : <header style={{ flex: 1 }}>
            Component Tree
          </header>}
          <button onClick={() => editComponent(componentId)}>
            <Pencil2Icon width={18} height={18} />
          </button>
        </section>
        <section
          ref={setDroppableRef}
          className={style.childrenSection}
          data-active={active}
          data-over={isOverDroppable}
          data-show={!collapsed && !isDragging}
        >
          {componentChildren.map((component) => (
            <ComponentTreeItem
              key={component.id}
              componentId={component.id}
              treeData={treeData}
              editComponent={editComponent}
            />
          ))}
        </section>
      </div>
    </div>
  );
};
