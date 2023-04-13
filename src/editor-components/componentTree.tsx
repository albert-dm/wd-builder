import { getBackendOptions, MultiBackend, Tree } from "@minoru/react-dnd-treeview"
import { DndProvider } from "react-dnd"
import { MinusCircledIcon, PlusCircledIcon, Pencil2Icon, DotFilledIcon } from '@radix-ui/react-icons'
import { ComponentTree } from "../types";
import { MouseEvent } from "react";

const itemIcons = {
  'open': <MinusCircledIcon width={18} height={18} />,
  'closed': <PlusCircledIcon width={18} height={18} />,
  'noChildren': <DotFilledIcon width={18} height={18} />
}

interface ComponentTreeDisplayProps {
  treeData: ComponentTree;
  setTreeData: (tree: ComponentTree) => void;
  selectedComponentId: string | number;
  setSelectedComponentId: (id: string | number) => void;
}

export const ComponentTreeDisplay: React.FC<ComponentTreeDisplayProps> = ({ 
    treeData,
    setTreeData,
    selectedComponentId,
    setSelectedComponentId
  }) => {
  const handleDrop = (newTreeData: ComponentTree) => setTreeData(newTreeData);
  const handleSelectComponent = (e: MouseEvent,id: string | number) => {
    e.stopPropagation();
    setSelectedComponentId(id);
  }
  const handleSelectRootComponent = () => {
    setSelectedComponentId(0);
  }
  return <DndProvider backend={MultiBackend} options={getBackendOptions()}>
    <Tree
      tree={treeData as any}
      initialOpen
      rootId={0}
      sort={false}
      insertDroppableFirst={false}
      dropTargetOffset={5}
      canDrop={(tree, { dragSource, dropTargetId }) => {
        if (dragSource?.parent === dropTargetId) {
          return true;
        }
      }}
      classes={{
        root: `p-2 pb-4 bg-gray-400 border ${selectedComponentId === 0 ? 'border-red-500' : 'border-black'}`,
      }}
      rootProps={{
        onClick: handleSelectRootComponent
      }}
      listComponent="div"
      listItemComponent="div"
      render={(node, { depth, isOpen, onToggle, hasChild, isDropTarget }) => {
        const itemIconType = !hasChild ? 'noChildren' :
          isOpen ? 'open' : 'closed';
        return <div 
          onClick={(e) => handleSelectComponent(e, node.id)} 
            className={`flex flex-row gap-1 border bg-white ${node.id === selectedComponentId ? 'border-red-500' : 'border-black'}`} style={{marginLeft: 30* depth}}
          >
          <button onClick={onToggle} disabled={!hasChild}>
            {itemIcons[itemIconType]}
          </button>
          <p>{node.text}</p>
          <button>
            <Pencil2Icon width={18} height={18} />
          </button>
        </div>
      }}
      placeholderComponent="div"
      placeholderRender={(node, { depth }) => <div style={{marginLeft: 30* depth}}>Mover</div>}
      onDrop={handleDrop as any}
    />
  </DndProvider>
}