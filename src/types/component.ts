import type React from "react";
import type { ReactNode } from "react";
import type { ZodObject } from "zod";

export type ComponentData = {
  label: string;
  id: string;
  parentId?: string;
  droppable: boolean;
  data: {
    componentCollection: string;
    componentName: string;
    props?: { [prop: string]: any };
  };
};

export type ComponentTree = ComponentData[];

export type ExtendedComponent = (
  | React.FC<any>
  | ReactNode
  | Element
  | React.Component
) & {
  defaultProps?: ComponentData["data"]["props"];
  zodSchema?: ZodObject<any>;
};

export interface CanvasComponentList {
  [CollectionName: string]: {
    [key: string]: ExtendedComponent;
  };
}
