import React, { useEffect, useRef, useState } from 'react';
import { ComponentData, ExtendedComponent } from '../types/component';
import * as Portal from '@radix-ui/react-portal';
import debounce from 'debounce';

import { BasicPropEditor } from './propEditor/basicPropEditor';

type EditionModalProps = {
  open: boolean;
  onClose: () => void;
  setComponent: (component: ComponentData) => void;
  componentData: ComponentData;
  componentSchema: ExtendedComponent['zodSchema'];
}

export const EditionModal = ({
  open,
  onClose,
  setComponent,
  componentData,
  componentSchema,
}: EditionModalProps) => {
  const [newProps, setNewProps] = useState(componentData.data.props || {});
  const [newComponentLabel, setNewComponentLabel] = useState(componentData.label);
  const [error, setError] = useState<string | null>(null);
  const selectedComponent = useRef(componentData.data.componentName);

  useEffect(() => {
    if (!open) return;
    if (selectedComponent.current !== componentData.data.componentName) {
      setNewProps(componentData.data.props || {});
      setNewComponentLabel(componentData.label);
      selectedComponent.current = componentData.data.componentName
    }
  }, [componentData]);

  useEffect(() => {
    if (!open) return;
    debounce(handleSave, 1000)();
  }, [newProps, newComponentLabel]);

  const handleSave = () => {
    const parsedPropsData = componentSchema?.safeParse(newProps);

    if (parsedPropsData && !parsedPropsData.success) {
      return setError(parsedPropsData.error.message);
    }

    const safePropsData = parsedPropsData?.success ? parsedPropsData.data : newProps;

    setComponent({
      ...componentData,
      label: newComponentLabel,
      data: {
        ...componentData.data,
        props: safePropsData,
      }
    });
  }

  return <Portal.Root>
    <dialog open={open} style={{
    position: 'absolute',
    top: '200px',
    margin: 'auto',
    minWidth: '300px',
  }}>
    <h1>Component Edition</h1>
    <input name="component-label" type="text" value={newComponentLabel} onChange={(e) => setNewComponentLabel(e.target.value)} />
    <BasicPropEditor value={newProps} onChange={setNewProps} error={error} setError={setError} />
    <button onClick={onClose} >Close</button>
  </dialog>
  </Portal.Root>
}