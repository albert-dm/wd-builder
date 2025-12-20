import type React from "react";
import type { ZodObject } from "zod";

export type ComponentData = {
  label: string;
  id: string;
  parentId?: string;
  droppable: boolean;
  data: {
    componentCollection: string;
    componentName: string;
    props?: { [prop: string]: unknown };
  };
};

export type ComponentTree = ComponentData[];

// biome-ignore lint/suspicious/noExplicitAny: ExtendedComponent needs to accept any props shape
export type ExtendedComponent<P = any> = React.FC<P> & {
  defaultProps?: ComponentData["data"]["props"];
  // biome-ignore lint/suspicious/noExplicitAny: ZodObject requires any for generic schema types
  zodSchema?: ZodObject<any>;
};

export interface CanvasComponentList {
  [CollectionName: string]: {
    [key: string]: ExtendedComponent;
  };
}
