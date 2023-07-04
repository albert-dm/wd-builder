import React, { CSSProperties, useMemo } from "react";
import { ComponentData, ComponentTree } from "../../types/component";
import { useSortable } from "@dnd-kit/sortable";
import {
  MinusCircledIcon,
  PlusCircledIcon,
  Pencil2Icon,
  DotFilledIcon,
} from "@radix-ui/react-icons";

const itemIcons = {
  open: <MinusCircledIcon width={18} height={18} />,
  closed: <PlusCircledIcon width={18} height={18} />,
  noChildren: <DotFilledIcon width={18} height={18} />,
};

interface ComponentTreeItemProps {
  label: string;
  componentId: ComponentData["id"];
  depth: number;
  childrenComponents: ComponentData[];
}

export const ComponentTreeItem: React.FC<ComponentTreeItemProps> = ({
  label,
  componentId,
  depth,
  childrenComponents,
}) => {
  const { attributes, listeners, setNodeRef, isDragging, transform, isOver, transition } =
    useSortable({ id: componentId.toString() });

  const itemStyle = (): CSSProperties => ({
    backgroundColor: "white",
    border: `1px solid ${isDragging ? "#f0f0f0" : "white"}`,
    transform: transform && isDragging
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    paddingLeft: `${depth}rem`,
  });

  const placeHolderStyle = {
    marginLeft: `${depth}rem`,
    height: '2px',
    backGroundColor: 'black',
  }

  return (
    <>
      <div ref={setNodeRef} style={itemStyle()} {...listeners} {...attributes}>
        {childrenComponents.length > 0 ? itemIcons.open : itemIcons.noChildren}
        {label} - {depth}
      </div>
      {isOver && <hr style={placeHolderStyle} />}
    </>
  );
};
