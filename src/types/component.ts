import React, { ReactNode } from "react"

export type ComponentData = {
  label: string
  id: string
  parentId?: string
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
    [key: string]: (React.FC<any> | ReactNode | Element | React.Component) & {defaultProps?: ComponentData['data']['props']};
  };
}
