import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { ComponentTree } from "../../types/component";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface ComponentTreeRootProps {
  tree: ComponentTree;
  children: React.ReactNode;
}

export const ComponentTreeRoot = ({
  tree,
  children,
}: ComponentTreeRootProps) => {
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: "0",
  });
  return (
    <section ref={setDroppableRef}>
      <SortableContext items={tree} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </section>
  );
};
