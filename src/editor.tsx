'use client'

import React, { ReactNode, useState } from 'react';
import { ComponentTree } from './types/component';
import { Canvas } from './editor-components/canvas';
import { WdComponents } from './';

import style from './editor.module.css';

export type EditorProps = {
  initialTree?: ComponentTree;
}

export const Editor = ({initialTree}: EditorProps ) => {
  const [treeData, setTreeData] = useState(initialTree ?? []);
  return <div className={style.canvasWrapper}>
    <Canvas tree={treeData} setTreeData={setTreeData} components={{
      WdComponents,
      // 'Custom': {
      //   Button,
      // },
      // 'WebDrops': {
      //   Logo,
      //   Header,
      //   Icon,
      // }
    }}/>
  </div>
}
