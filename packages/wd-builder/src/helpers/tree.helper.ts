import { arrayMove } from "@dnd-kit/sortable";
import type { ComponentData, ComponentTree } from "../types/component";

export const getComponentChildren = (
  tree: ComponentTree,
  componentId: string,
): ComponentData[] => {
  const componentChildren = tree.filter(
    (comp) => comp.parentId === componentId,
  );
  return componentChildren;
};

export const getComponentDepth = (
  tree: ComponentTree,
  componentId: string,
): number => {
  let parentCount = 0;
  let componentParentId = tree.find(
    (comp) => comp.id === componentId,
  )?.parentId;
  while (componentParentId !== undefined) {
    parentCount++;
    componentParentId = tree.find(
      (comp) => comp.id === componentParentId,
    )?.parentId;
  }
  return parentCount;
};

export function getProjected(
  items: ComponentTree,
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number,
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItemDepth = getComponentDepth(items, activeId);
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = Math.round(dragOffset / indentationWidth);
  const projectedDepth = activeItemDepth + dragDepth;
  const maxDepth = getComponentDepth(items, previousItem.id);
  const minDepth = getComponentDepth(items, nextItem.id);
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return undefined;
    }

    if (depth === maxDepth) {
      return previousItem.parentId;
    }

    if (depth > maxDepth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => getComponentDepth(items, item.id) === depth)?.parentId;

    return newParent ?? undefined;
  }
}

export const getOrderedList = (
  treeData: ComponentTree,
  rootComponent: ComponentData,
) => {
  let newTreeData: ComponentTree = [];
  newTreeData.push(rootComponent);
  const children = getComponentChildren(treeData, rootComponent.id);
  if (children.length === 0) {
    return newTreeData;
  }
  children.forEach((child) => {
    const nextComponents = getOrderedList(treeData, child);
    newTreeData = [...newTreeData, ...nextComponents];
  });

  return newTreeData;
};

export const deleteComponentWithChildren = (
  treeData: ComponentTree,
  componentId: string,
) => {
  const componentChildren = getComponentChildren(treeData, componentId);
  if (componentChildren.length === 0) {
    return treeData.filter((comp) => comp.id !== componentId);
  }
  componentChildren.forEach((child) => {
    treeData = deleteComponentWithChildren(treeData, child.id);
  });
  return treeData.filter((comp) => comp.id !== componentId);
};

// Types for dnd-kit-sortable-tree
export type TreeItemData = Omit<ComponentData, "parentId"> & {
  children: TreeItemData[];
  collapsed?: boolean;
};

/**
 * Converts a flat ComponentTree (with parentId references) to a nested tree structure
 * for use with dnd-kit-sortable-tree
 */
export const flatTreeToNested = (
  flatTree: ComponentTree,
  collapsedIds?: Set<string>,
): TreeItemData[] => {
  const itemMap = new Map<string, TreeItemData>();

  // Create all items without children first
  for (const item of flatTree) {
    itemMap.set(item.id, {
      id: item.id,
      label: item.label,
      droppable: item.droppable,
      data: item.data,
      children: [],
      collapsed: collapsedIds?.has(item.id) ?? false,
    });
  }

  const rootItems: TreeItemData[] = [];

  // Build the tree by assigning children to parents
  for (const item of flatTree) {
    const treeItem = itemMap.get(item.id);
    if (!treeItem) continue;

    if (item.parentId) {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        parent.children.push(treeItem);
      }
    } else {
      rootItems.push(treeItem);
    }
  }

  return rootItems;
};

/**
 * Converts a nested tree structure back to a flat ComponentTree with parentId references
 */
export const nestedTreeToFlat = (
  nestedTree: TreeItemData[],
  parentId?: string,
): ComponentTree => {
  const flatTree: ComponentTree = [];

  for (const item of nestedTree) {
    const flatItem: ComponentData = {
      id: item.id,
      label: item.label,
      droppable: item.droppable,
      data: item.data,
      ...(parentId && { parentId }),
    };
    flatTree.push(flatItem);

    if (item.children.length > 0) {
      const childItems = nestedTreeToFlat(item.children, item.id);
      flatTree.push(...childItems);
    }
  }

  return flatTree;
};
