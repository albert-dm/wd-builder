import { useSortable } from "@dnd-kit/sortable";
import {
  DotFilledIcon,
  MinusCircledIcon,
  Pencil2Icon,
  PlusCircledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import type React from "react";
import { useMemo } from "react";
import type { ComponentData } from "../../types/component";
import style from "./componentTreeItem.module.css";

const itemIcons = {
  open: <MinusCircledIcon width={18} height={18} />,
  closed: <PlusCircledIcon width={18} height={18} />,
  noChildren: <DotFilledIcon width={18} height={18} />,
};
interface ComponentTreeItemProps {
  component: ComponentData;
  editComponent: (id: string) => void;
  hasChildren: boolean;
  depth: number;
  selected: boolean;
  collapsed: boolean;
  disabled: boolean;
  selectComponent: () => void;
  deleteComponent: () => void;
  toggleCollapseComponent: () => void;
}

export const ComponentTreeItem: React.FC<ComponentTreeItemProps> = ({
  component,
  editComponent,
  hasChildren,
  depth,
  selected,
  collapsed,
  disabled,
  selectComponent,
  deleteComponent,
  toggleCollapseComponent,
}) => {
  const { label, id } = component;
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    isDragging,
    transform,
    transition,
  } = useSortable({ id });

  const isRoot = useMemo(() => !component.parentId, [component.parentId]);

  const itemStyle = {
    transform:
      transform && isDragging
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
    transition,
    marginLeft: `${depth * 10}px`,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      selectComponent();
    }
  };

  return (
    <div ref={setSortableRef}>
      <button
        type="button"
        onClick={selectComponent}
        onKeyDown={handleKeyDown}
        style={itemStyle}
        className={style.treeItemWrapper}
        data-dragging={isDragging}
      >
        <section
          className={style.treeItemSection}
          data-selected={selected}
          data-disabled={disabled}
        >
          <button
            type="button"
            onClick={hasChildren ? toggleCollapseComponent : undefined}
          >
            {hasChildren
              ? collapsed
                ? itemIcons.closed
                : itemIcons.open
              : itemIcons.noChildren}
          </button>

          <header {...listeners} {...attributes} style={{ flex: 1 }}>
            {label}
          </header>
          <button type="button" onClick={() => editComponent(id)}>
            <Pencil2Icon width={18} height={18} />
          </button>
          {!isRoot && (
            <button type="button" onClick={() => deleteComponent()}>
              <TrashIcon width={18} height={18} />
            </button>
          )}
        </section>
      </button>
    </div>
  );
};
