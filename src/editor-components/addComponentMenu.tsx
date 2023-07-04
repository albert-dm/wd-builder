import React from "react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
// import { PlusIcon } from "@radix-ui/react-icons";
import { CanvasComponentList, ComponentData } from "../types/component";
import { button } from "../wd-components/button.style";

interface AddComponentMenuProps {
  components: CanvasComponentList;
  onAdd: (componentData: ComponentData) => void;
}

const menuStyles = {
  backgroundColor: 'white',
  boxShadow: '0 0 10px rgba(0,0,0,.1)',
  color: 'black',
};

export const AddComponentMenu: React.FC<AddComponentMenuProps> = ({
  components,
  onAdd,
}) => {
  const handleComponentAdd = (componentCollection: string, componentName: string) => {
    const component = components[componentCollection][componentName];
    const defaultComponentData: ComponentData = {
      id: Math.random().toString(),
      droppable: true,
      label: 'New ' + componentName,
      parentId: '0',
      data: {
        componentName,
        componentCollection,
        props: component?.defaultProps || {},
      },
    }


    onAdd(defaultComponentData);
  }
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button style={button('primary')}>
          Add Component {/* <PlusIcon /> */}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          style={menuStyles}
          sideOffset={5}
        >
          {Object.keys(components).map((componentCollection) => (
            <>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger style={button('primary')}>
                  {componentCollection}
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent style={menuStyles}>
                    {Object.keys(components[componentCollection]).map(
                      (componentName) => (
                        <DropdownMenu.Item
                          key={componentName}
                          style={button('primary')}
                          onClick={() =>
                            handleComponentAdd(componentCollection, componentName)
                          }
                        >
                          {componentName}
                        </DropdownMenu.Item>
                      )
                    )}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>

              <DropdownMenu.Separator />
              <DropdownMenu.Arrow />
            </>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
