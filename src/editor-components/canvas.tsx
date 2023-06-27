// import "./styles.scss";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { createCanvas } from "../helpers/canvas.helper";
import { componentToJsx, getImports } from "../helpers/editor.helper";
import { Toolbar } from "./toolbar";
import { CanvasComponentList, ComponentTree } from "../types/component";
import * as Tabs from "@radix-ui/react-tabs";
import { CodeIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { canvasWrapper, previewArea } from "./canvas.style";

interface CanvasProps {
  tree: ComponentTree;
  setTreeData: (tree: ComponentTree) => void;
  components?: CanvasComponentList;
}

export const Canvas: React.FC<CanvasProps> = ({
  tree,
  setTreeData,
  components = {},
}) => {
  const canvasElement = useRef<HTMLDivElement | null>(null);
  const editor = useRef<ReturnType<typeof createCanvas> | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('preview');

  const rootComp = tree.find((c) => c.id === '0');

  const code = getImports(tree) + componentToJsx(rootComp!, tree);

  useEffect(() => {
    if (!canvasElement.current) throw new Error("Canvas element not found");
    if (!editor.current) {
      editor.current = createCanvas(canvasElement.current, components);
    }
    editor.current.run(code);
  }, [code, components]);

  return (
    <section style={canvasWrapper}>
      <Toolbar components={components} tree={tree} setTree={setTreeData}/>
      <Tabs.Root value={currentTab} onValueChange={setCurrentTab} style={previewArea}>
          <Tabs.List>
            <Tabs.Trigger value="code">
              <CodeIcon width={24} /> Código
            </Tabs.Trigger>
            <Tabs.Trigger value="preview">
              <EyeOpenIcon width={24} /> Preview
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="code" className="h-full" forceMount hidden={currentTab !== 'code'}>
            <textarea
              value={code}
              onChange={(e) => setTreeData(JSON.parse(e.target.value))}
            />
          </Tabs.Content>
          <Tabs.Content value="preview" forceMount hidden={currentTab !== 'preview'}>
            <div
              ref={(div) => (canvasElement.current = div)}
            />
          </Tabs.Content>
      </Tabs.Root>
    </section>
  );
};
