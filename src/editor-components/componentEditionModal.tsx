import React, { useEffect, useState } from 'react';
import { ComponentData, ExtendedComponent } from '../types/component';
import { BasicPropEditor } from './basicPropEditor';

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

  useEffect(() => {
    setNewProps(componentData.data.props || {});
    setNewComponentLabel(componentData.label);
  }, [componentData]);

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

    onClose();
  }

  const handleCancel = () => {
    onClose();
  }

  return <dialog open={open} style={{
    position: 'fixed',
    margin: 'auto',
    minWidth: '300px',
  }}>
    <h1>Component Edition</h1>
    <input name="component-label" type="text" value={newComponentLabel} onChange={(e) => setNewComponentLabel(e.target.value)} />
    <BasicPropEditor value={newProps} onChange={setNewProps} error={error} setError={setError} />
    <button onClick={handleSave}>Save</button>
    <button onClick={handleCancel} >Cancel</button>
  </dialog>
}