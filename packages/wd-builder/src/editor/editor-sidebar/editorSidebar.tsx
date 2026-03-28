import { ChevronDownIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import {
  SimpleTreeItemWrapper,
  SortableTree,
  type TreeItemComponentProps,
  type TreeItems,
} from "dnd-kit-sortable-tree";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  flatTreeToNested,
  nestedTreeToFlat,
  type TreeItemData,
} from "../../helpers/tree.helper";
import type {
  CanvasComponentList,
  ComponentData,
  ComponentTree,
} from "../../types/component";
import { AddComponentMenu } from "../addComponentMenu";
import { EditionModal } from "../componentEditionModal";
import style from "./editorSidebar.module.css";

interface EditorSidebarProps {
  components: CanvasComponentList;
  tree: ComponentTree;
  setTree: (tree: ComponentTree) => void;
}

// Context for tree item actions
interface TreeItemContextValue {
  selectedId: string;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TreeItemContext = createContext<TreeItemContextValue | null>(null);

// Tree item component for dnd-kit-sortable-tree
const TreeItemComponent = React.forwardRef<
  HTMLDivElement,
  TreeItemComponentProps<TreeItemData>
>((props, ref) => {
  const { item, onCollapse, collapsed, childCount, ...rest } = props;
  const ctx = useContext(TreeItemContext);

  if (!ctx) {
    throw new Error("TreeItemComponent must be used within TreeItemContext");
  }

  const { selectedId, onSelect, onEdit, onDelete } = ctx;
  const isSelected = item.id === selectedId;
  const isRoot = !props.depth || props.depth === 0;
  const hasChildren = (childCount ?? 0) > 0;

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (hasChildren && onCollapse) {
      onCollapse();
    }
  };

  return (
    <SimpleTreeItemWrapper
      {...rest}
      ref={ref}
      item={item}
      collapsed={collapsed}
      onCollapse={onCollapse}
      childCount={childCount}
      hideCollapseButton
      disableCollapseOnItemClick
    >
      <div
        className={style.treeItem}
        data-selected={isSelected}
        data-dragging={props.clone}
        data-ghost={props.ghost}
      >
        <button
          type="button"
          className={style.collapseIcon}
          data-collapsed={collapsed}
          data-has-children={hasChildren}
          onClick={handleCollapseClick}
          tabIndex={hasChildren ? 0 : -1}
          aria-label={collapsed ? "Expand" : "Collapse"}
          aria-expanded={!collapsed}
          disabled={!hasChildren}
        >
          <ChevronDownIcon width={16} height={16} />
        </button>
        <button
          type="button"
          className={style.treeItemContent}
          onClick={() => onSelect(item.id)}
        >
          <span className={style.treeItemLabel}>{item.label}</span>
        </button>
        <span className={style.treeItemActions}>
          <button
            type="button"
            className={style.actionButton}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item.id);
            }}
            title="Edit component"
          >
            <Pencil2Icon width={14} height={14} />
          </button>
          {!isRoot && (
            <button
              type="button"
              className={style.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              title="Delete component"
            >
              <TrashIcon width={14} height={14} />
            </button>
          )}
        </span>
      </div>
    </SimpleTreeItemWrapper>
  );
});

TreeItemComponent.displayName = "TreeItemComponent";

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  components,
  tree,
  setTree,
}) => {
  const [selectedComponentId, setSelectedComponentId] = useState<string>("0");
  const [showEditionModal, setShowEditionModal] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Convert flat tree to nested for SortableTree
  const nestedItems = useMemo(
    () => flatTreeToNested(tree, collapsedIds) as TreeItems<TreeItemData>,
    [tree, collapsedIds],
  );

  const handleItemsChanged = (newItems: TreeItems<TreeItemData>) => {
    // Extract collapsed state from the items
    const extractCollapsed = (items: TreeItemData[]): Set<string> => {
      const collapsed = new Set<string>();
      for (const item of items) {
        if (item.collapsed) {
          collapsed.add(item.id);
        }
        if (item.children.length > 0) {
          const childCollapsed = extractCollapsed(item.children);
          for (const id of childCollapsed) {
            collapsed.add(id);
          }
        }
      }
      return collapsed;
    };
    setCollapsedIds(extractCollapsed(newItems as TreeItemData[]));

    const flatTree = nestedTreeToFlat(newItems as TreeItemData[]);
    setTree(flatTree);
  };

  const handleComponentAdd = (componentData: ComponentData) => {
    const newComponent: ComponentData = {
      ...componentData,
      parentId: selectedComponentId,
    };
    setTree([...tree, newComponent]);
  };

  const handleDeleteComponent = useCallback(
    (id: string) => {
      // Find all descendants
      const idsToDelete = new Set<string>([id]);
      const findDescendants = (parentId: string) => {
        for (const item of tree) {
          if (item.parentId === parentId) {
            idsToDelete.add(item.id);
            findDescendants(item.id);
          }
        }
      };
      findDescendants(id);

      const newTree = tree.filter((item) => !idsToDelete.has(item.id));
      setTree(newTree);

      // Reset selection if deleted item was selected
      if (idsToDelete.has(selectedComponentId)) {
        setSelectedComponentId("0");
      }
    },
    [tree, setTree, selectedComponentId],
  );

  const selectedComponentData = useMemo(() => {
    return tree.find((c) => c.id === selectedComponentId);
  }, [selectedComponentId, tree]);

  const selectedComponentMeta = useMemo(() => {
    if (!selectedComponentData) return null;
    return (
      components[selectedComponentData.data.componentCollection]?.[
        selectedComponentData.data.componentName
      ] || null
    );
  }, [components, selectedComponentData]);

  const handleChangeComponent = (component: ComponentData) => {
    const newTree = tree.map((c) => {
      if (c.id === component.id) {
        return component;
      }
      return c;
    });
    setTree(newTree);
  };

  const handleExportTree = () => {
    console.log("Exported Tree:", JSON.stringify(tree, null, 2));
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(tree, null, 2));
  };

  const treeItemContextValue: TreeItemContextValue = useMemo(
    () => ({
      selectedId: selectedComponentId,
      onSelect: setSelectedComponentId,
      onEdit: (id: string) => {
        setSelectedComponentId(id);
        setShowEditionModal(true);
      },
      onDelete: handleDeleteComponent,
    }),
    [selectedComponentId, handleDeleteComponent],
  );

  return (
    <aside className={style.editorSidebar}>
      <header className={style.sidebarHeader}>
        <h3 className={style.sidebarTitle}>WD Builder</h3>
      </header>

      <section className={style.actionsSection}>
        <AddComponentMenu components={components} onAdd={handleComponentAdd} />
        <button type="button" onClick={handleExportTree}>
          Export Tree
        </button>
      </section>

      <section className={style.treeSection}>
        <h4 className={style.treeSectionTitle}>Component Tree</h4>
        <TreeItemContext.Provider value={treeItemContextValue}>
          <SortableTree
            items={nestedItems}
            onItemsChanged={handleItemsChanged}
            TreeItemComponent={TreeItemComponent}
            indentationWidth={20}
            indicator
          />
        </TreeItemContext.Provider>
      </section>

      {showEditionModal && selectedComponentData && (
        <EditionModal
          componentData={selectedComponentData}
          componentSchema={selectedComponentMeta?.zodSchema}
          open={showEditionModal}
          onClose={() => setShowEditionModal(false)}
          setComponent={handleChangeComponent}
        />
      )}
    </aside>
  );
};
