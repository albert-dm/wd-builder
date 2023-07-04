import React, { CSSProperties, useMemo } from "react";
import { ComponentData, ComponentTree } from "../../types/component";
import { useSortable } from "@dnd-kit/sortable";
import {
  MinusCircledIcon,
  PlusCircledIcon,
  Pencil2Icon,
  DotFilledIcon,
} from "@radix-ui/react-icons";
import * as Collapsible from "@radix-ui/react-collapsible";
import { getComponentChildren } from "../../helpers/tree.helper";
import { useDroppable } from "@dnd-kit/core";

const itemIcons = {
  open: <MinusCircledIcon width={18} height={18} />,
  closed: <PlusCircledIcon width={18} height={18} />,
  noChildren: <DotFilledIcon width={18} height={18} />,
};

interface ComponentTreeItemProps {
  componentId: ComponentData["id"];
  treeData: ComponentTree;
}

const treeItemWrapper: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "0.5rem",
  border: "1px solid black",
};

const childrenSectionStyle = (show: Boolean, isOver: Boolean, isActive: Boolean): CSSProperties => ({
  paddingLeft: "1rem",
  paddingTop: isActive ? ".2rem" : 0,
  paddingBottom: isActive ? ".8rem" : 0,
  backgroundColor: isOver ? "lightGrey" : "white",
  gap: "0.5rem",
  display: show ? "flex" : "none",
  flexDirection: "column",
});

export const ComponentTreeItem: React.FC<ComponentTreeItemProps> = ({
  componentId,
  treeData,
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

  const itemStyle = (): CSSProperties => ({
    backgroundColor: "white",
    border: `1px solid ${isDragging ? "#f0f0f0" : "white"}`,
    transform:
      transform && isDragging
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    transition,
    marginBottom: '0.5rem',
    marginTop: '0.5rem',
  });

  const placeHolderStyle = {
    height: "2px",
    backGroundColor: "black",
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
      <div style={itemStyle()}>
        {!isRoot && (
          <section style={treeItemWrapper}>
            <button onClick={
              () => {
                setCollapsed(!collapsed);
              }
            }>
            {componentChildren.length > 0
              ? itemIcons.open
              : itemIcons.noChildren}
            </button>
           
            <header {...listeners} {...attributes} style={{flex: 1}}>
              {label} - ({componentId})
            </header>
          </section>
        )}
        <section
          ref={setDroppableRef}
          style={childrenSectionStyle(!collapsed && !isDragging, isOverDroppable, Boolean(active))}
        >
          {componentChildren.map((component) => (
            <ComponentTreeItem
              key={component.id}
              componentId={component.id}
              treeData={treeData}
            />
          ))}
        </section>
      </div>
    </div>
  );
};
