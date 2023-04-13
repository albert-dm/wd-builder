import React from "react"

export type ComponentData = {
  text: string
  id: string | number
  parent?: string | number
  droppable: boolean
  data: {
    componentCollection: string,
    componentName: string,
    props?: {[prop: string]: any},
  }
}

export type ComponentTree = ComponentData[]

export interface CanvasComponentList {
  [CollectionName: string]: {
    [key: string]: CanvasComponent<any>;
  };
}

// TODO: otimizar esses tipos
export class CanvasComponent<T> extends React.Component<T>{
  defaultData?: ComponentData;
}