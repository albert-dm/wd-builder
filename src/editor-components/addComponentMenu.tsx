import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { CanvasComponentList, ComponentData } from "../types";

interface AddComponentMenuProps {
  components: CanvasComponentList;
  onAdd: (componentData: ComponentData) => void;
}

export const AddComponentMenu: React.FC<AddComponentMenuProps> = ({
  components,
  onAdd,
}) => {
  const handleComponentAdd = (componentCollection: string, componentName: string) => {
    const component = components[componentCollection][componentName];
    const defaultComponentData: ComponentData = {
      id: Math.random(),
      droppable: true,
      text: 'New ' + componentName,
      parent: 0,
      data: {
        componentName,
        componentCollection,
        props: component,
      },
    }

    const componentData = component.defaultData ?? {};

    onAdd({
      ...defaultComponentData,
      ...componentData,
    });
  }
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>
          Add Component <PlusIcon />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[220px] bg-white rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)] will-change-[opacity,transform] data-[side=top]:animate-slideDownAndFade data-[side=right]:animate-slideLeftAndFade data-[side=bottom]:animate-slideUpAndFade data-[side=left]:animate-slideRightAndFade"
          sideOffset={5}
        >
          {Object.keys(components).map((componentCollection) => (
            <>
              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>
                  {componentCollection}
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent>
                    {Object.keys(components[componentCollection]).map(
                      (componentName) => (
                        <DropdownMenu.Item
                          key={componentName}
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
