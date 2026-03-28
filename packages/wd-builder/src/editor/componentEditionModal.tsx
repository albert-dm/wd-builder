import * as Portal from "@radix-ui/react-portal";
import debounce from "debounce";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentData, ExtendedComponent } from "../types/component";
import { SchemaForm } from "./form-fields/schema-form";
import { BasicPropEditor } from "./prop-editor/basicPropEditor";

type EditionModalProps = {
  open: boolean;
  onClose: () => void;
  setComponent: (component: ComponentData) => void;
  componentData: ComponentData;
  componentSchema: ExtendedComponent["zodSchema"];
};

export const EditionModal = ({
  open,
  onClose,
  setComponent,
  componentData,
  componentSchema,
}: EditionModalProps) => {
  const [newProps, setNewProps] = useState(componentData.data.props || {});
  const [newComponentLabel, setNewComponentLabel] = useState(
    componentData.label,
  );
  const [error, setError] = useState<string | null>(null);
  const selectedComponent = useRef(componentData.data.componentName);

  useEffect(() => {
    if (!open) return;
    if (selectedComponent.current !== componentData.data.componentName) {
      setNewProps(componentData.data.props || {});
      setNewComponentLabel(componentData.label);
      selectedComponent.current = componentData.data.componentName;
    }
  }, [componentData, open]);

  const handleSave = useCallback(() => {
    const parsedPropsData = componentSchema?.safeParse(newProps);

    if (parsedPropsData && !parsedPropsData.success) {
      return setError(parsedPropsData.error.message);
    }

    const safePropsData = parsedPropsData?.success
      ? parsedPropsData.data
      : newProps;

    setComponent({
      ...componentData,
      label: newComponentLabel,
      data: {
        ...componentData.data,
        props: safePropsData,
      },
    });
  }, [
    componentData,
    componentSchema,
    newComponentLabel,
    newProps,
    setComponent,
  ]);

  useEffect(() => {
    if (!open) return;
    const debouncedSave = debounce(handleSave, 1000);
    debouncedSave();
    return () => debouncedSave.clear();
  }, [open, handleSave]);

  return (
    <Portal.Root>
      <dialog
        open={open}
        style={{
          position: "absolute",
          top: "200px",
          margin: "auto",
          minWidth: "300px",
        }}
      >
        <h1>Component Edition</h1>
        <input
          name="component-label"
          type="text"
          value={newComponentLabel}
          onChange={(e) => setNewComponentLabel(e.target.value)}
        />
        {componentSchema ? (
          <SchemaForm
            schema={componentSchema}
            values={newProps as Record<string, unknown>}
            onChange={(values) => setNewProps(values)}
          />
        ) : (
          <BasicPropEditor
            value={newProps}
            onChange={(value) =>
              setNewProps(value as { [prop: string]: unknown })
            }
            error={error}
            setError={setError}
          />
        )}
        {error && (
          <strong style={{ color: "red", fontSize: "0.75rem" }}>{error}</strong>
        )}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </dialog>
    </Portal.Root>
  );
};
