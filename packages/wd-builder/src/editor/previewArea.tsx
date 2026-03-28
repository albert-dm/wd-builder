import { CodeIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import * as Tabs from "@radix-ui/react-tabs";
import { useEffect, useMemo, useRef, useState } from "react";
import { createCanvas } from "../helpers/canvas.helper";
import { componentToJsx, getImports } from "../helpers/editor.helper";
import type { CanvasComponentList, ComponentTree } from "../types/component";
import style from "./previewArea.module.css";

type PreviewAreaProps = {
  tree: ComponentTree;
  setTreeData: (tree: ComponentTree) => void;
  components?: CanvasComponentList;
};

export const PreviewArea = ({
  tree,
  setTreeData: _setTreeData,
  components,
}: PreviewAreaProps) => {
  const canvasElement = useRef<HTMLDivElement | null>(null);
  const editor = useRef<ReturnType<typeof createCanvas> | null>(null);

  const [currentTab, setCurrentTab] = useState<string>("render");

  const rootComp = useMemo(() => tree.find((c) => c.id === "0"), [tree]);

  const code = useMemo(() => {
    if (!rootComp) return "";
    return getImports(tree) + componentToJsx(rootComp, tree);
  }, [tree, rootComp]);

  useEffect(() => {
    if (!canvasElement.current) throw new Error("Canvas element not found");
    if (!editor.current) {
      editor.current = createCanvas(canvasElement.current, components || {});
    }
    editor.current.run(code);
  }, [code, components]);

  return (
    <Tabs.Root
      value={currentTab}
      onValueChange={setCurrentTab}
      className={style.tabWrapper}
    >
      <Tabs.List className={style.tabItems}>
        <Tabs.Trigger value="code">
          <CodeIcon width={24} />
          <span>Code</span>
        </Tabs.Trigger>
        <Tabs.Trigger value="render">
          <EyeOpenIcon width={24} />
          <span>Preview</span>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content
        value="code"
        className="h-full"
        forceMount
        hidden={currentTab !== "code"}
      >
        <textarea value={code} readOnly />
      </Tabs.Content>
      <Tabs.Content value="render" forceMount hidden={currentTab !== "render"}>
        <div className={style.renderPreview} ref={canvasElement} />
      </Tabs.Content>
    </Tabs.Root>
  );
};
