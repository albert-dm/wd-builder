import { arrayMove } from "@dnd-kit/sortable";
import { ComponentData, ComponentTree } from "../types/component"

export const getComponentChildren = (tree: ComponentTree, componentId: string): ComponentData[] => {
  const componentChildren = tree.filter(comp => comp.parentId === componentId);
  return componentChildren;
};

export const getComponentDepth = (tree: ComponentTree, componentId: string): number => {
  let parentCount = 0
  let componentParentId = tree.find(comp => comp.id === componentId)?.parentId;
  while(componentParentId !== undefined) {
    parentCount++;
    componentParentId = tree.find(comp => comp.id === componentParentId)?.parentId;
  }
  return parentCount;
}

export function getProjected(
  items: ComponentTree,
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({id}) => id === overId);
  const activeItemIndex = items.findIndex(({id}) => id === activeId);
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

  return {depth, maxDepth, minDepth, parentId: getParentId()};

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