'use client'

import React, { ReactNode, useState } from 'react';
import { ComponentTree } from './types/component';
import { Canvas } from './editor-components/canvas';
import { WdComponents } from './';

import style from './editor.module.css';

const initialTree: ComponentTree = [
  {
    label: "Layout da Pagina",
    id: '0',
    droppable: true,
    data: {
      componentCollection: 'Layout',
      componentName: 'Section',
    }
  }
];

const Section: React.FC<{children: ReactNode}> = ({ children }) => <section>{children}</section>;
const Article: React.FC<{children: ReactNode}> = ({ children }) => <article>{children}</article>;
const Button: React.FC<{label: string}> = ({ label }) => <button>{label}</button>;

export const Editor = () => {
  const [treeData, setTreeData] = useState(initialTree);
  return <div className={style.canvasWrapper}>
    <Canvas tree={treeData} setTreeData={setTreeData} components={{
      WdComponents,
      // 'Custom': {
      //   Button,
      // },
      'Layout': {
        Section,
        Article,
        Button,
      },
      // 'WebDrops': {
      //   Logo,
      //   Header,
      //   Icon,
      // }
    }}/>
  </div>
}
