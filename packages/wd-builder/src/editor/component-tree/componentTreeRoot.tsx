import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type React from "react";
import type { ComponentTree } from "../../types/component";

interface ComponentTreeRootProps {
  tree: ComponentTree;
  children: React.ReactNode;
}

export const ComponentTreeRoot = ({
  tree,
  children,
}: ComponentTreeRootProps) => {
  return (
    <SortableContext items={tree} strategy={verticalListSortingStrategy}>
      {children}
    </SortableContext>
  );
};
