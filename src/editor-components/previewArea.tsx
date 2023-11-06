import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as Tabs from "@radix-ui/react-tabs";
import { CodeIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { createCanvas } from "../helpers/canvas.helper";
import { componentToJsx, getImports } from "../helpers/editor.helper";
import style from './previewArea.module.css';
import { CanvasComponentList, ComponentTree } from '../types/component';
import { Text } from '../wd-components';

type PreviewAreaProps = {
  tree: ComponentTree;
  setTreeData: (tree: ComponentTree) => void;
  components?: CanvasComponentList;
}

export const PreviewArea = ({ tree, setTreeData, components }: PreviewAreaProps) => {
  const canvasElement = useRef<HTMLDivElement | null>(null);
  const editor = useRef<ReturnType<typeof createCanvas> | null>(null);

  const [currentTab, setCurrentTab] = useState<string>('render');

  const rootComp = useMemo(() => tree.find((c) => c.id === '0'), [tree]);

  const code = useMemo(() => getImports(tree) + componentToJsx(rootComp!, tree), [tree, rootComp]);

  useEffect(() => {
    if (!canvasElement.current) throw new Error("Canvas element not found");
    if (!editor.current) {
      editor.current = createCanvas(canvasElement.current, components || {});
    }
    editor.current.run(code);
  }, [code, components]);

  return (
    <Tabs.Root value={currentTab} onValueChange={setCurrentTab} className={style.tabWrapper}>
      <Tabs.List className={style.tabItems}>
        <Tabs.Trigger value="code">
          <CodeIcon width={24} /><Text value='Código' />
        </Tabs.Trigger>
        <Tabs.Trigger value="render">
          <EyeOpenIcon width={24} /><Text value='Previsualização' />
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content
        value="code"
        className="h-full"
        forceMount
        hidden={currentTab !== "code"}
      >
        <textarea
          value={code}
          onChange={(e) => setTreeData(JSON.parse(e.target.value))}
        />
      </Tabs.Content>
      <Tabs.Content
        value="render"
        forceMount
        hidden={currentTab !== "render"}
      >
        <div
          className={style.renderPreview}
          ref={(div) => (canvasElement.current = div)}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
};
