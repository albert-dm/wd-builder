import React, { CSSProperties, useMemo } from "react";
import * as Collapsible from '@radix-ui/react-collapsible';
import { ComponentData, ComponentTree } from "../../types/component";
import { useDroppable, useDraggable } from "@dnd-kit/core";
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

const childrenSectionStyle = (isOver: Boolean) => ({
  paddingLeft: "1rem",
  paddingTop: "1rem",
  paddingBottom: "1rem",
  border: isOver ? "1px solid red" : "1px solid white",
});

interface ComponentTreeItemProps {
  componentId: ComponentData["id"];
  treeData: ComponentTree;
}

export const ComponentTreeItem: React.FC<ComponentTreeItemProps> = ({
  componentId,
  treeData,
}) => {
  const [showChildren, setShowChildren] = React.useState(true);
  const isRoot = componentId === "0";
  const componentData = useMemo(
    () => treeData.find((component) => component.id === componentId),
    [treeData, componentId]
  );
  const componentChildren = useMemo(
    () => treeData.filter((component) => component.parent === componentId),
    [treeData, componentId]
  );

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: componentId.toString(),
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
    isDragging,
  } = useDraggable({
    id: componentId.toString(),
  });

  const itemStyle = (): CSSProperties => ({
    backgroundColor: "white",
    border: `1px solid ${isDragging ? "#f0f0f0" : "white"}`,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    // paddingBottom: "1rem",

  });

  const label = componentData?.label || "Unnamed component";
  return <Collapsible.Root asChild open={showChildren && !isDragging} onOpenChange={setShowChildren}>
    <div
      ref={setDraggableRef}
      style={itemStyle()}
      {...listeners}
      {...attributes}
    >
      {!isRoot && (
        <header>
          <Collapsible.Trigger>
            {componentChildren.length > 0
              ? itemIcons.open
              : itemIcons.noChildren}
          </Collapsible.Trigger>
          {label}
        </header>
      )}
      <Collapsible.Content asChild >
        <section
          ref={setDroppableRef}
          style={childrenSectionStyle(isOver && !isDragging)}
        >
          {componentChildren.map((component) => (
            <ComponentTreeItem
              key={component.id}
              componentId={component.id}
              treeData={treeData}
            />
          ))}
        </section>
      </Collapsible.Content>
    </div>
    </Collapsible.Root>
};
