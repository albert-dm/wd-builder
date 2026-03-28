import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type React from "react";
// import { PlusIcon } from "@radix-ui/react-icons";
import { isBuilderComponent } from "../create-component";
import type { CanvasComponentList, ComponentData } from "../types/component";

interface AddComponentMenuProps {
  components: CanvasComponentList;
  onAdd: (componentData: ComponentData) => void;
}

const menuStyles = {
  backgroundColor: "white",
  boxShadow: "0 0 10px rgba(0,0,0,.1)",
  color: "black",
};

export const AddComponentMenu: React.FC<AddComponentMenuProps> = ({
  components,
  onAdd,
}) => {
  const handleComponentAdd = (
    componentCollection: string,
    componentName: string,
  ) => {
    const component = components[componentCollection][componentName];
    const droppable = isBuilderComponent(component)
      ? component.droppable
      : true;
    const defaultComponentData: ComponentData = {
      id: crypto.randomUUID(),
      droppable,
      label: `New ${componentName}`,
      parentId: "0",
      data: {
        componentName,
        componentCollection,
        props: component?.defaults ?? component?.defaultProps ?? {},
      },
    };

    onAdd(defaultComponentData);
  };
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button">Add Component {/* <PlusIcon /> */}</button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content style={menuStyles} sideOffset={5}>
          {Object.keys(components).map((componentCollection) => (
            <div key={componentCollection}>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>
                  {componentCollection}
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent style={menuStyles}>
                    {Object.keys(components[componentCollection]).map(
                      (componentName) => (
                        <DropdownMenu.Item
                          key={componentName}
                          className=""
                          onClick={() =>
                            handleComponentAdd(
                              componentCollection,
                              componentName,
                            )
                          }
                        >
                          {componentName}
                        </DropdownMenu.Item>
                      ),
                    )}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>

              <DropdownMenu.Separator />
              <DropdownMenu.Arrow />
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};
