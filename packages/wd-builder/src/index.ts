// Public API for @webdrops/wd-builder

export type {
  BuilderComponent,
  ComponentDefinition,
  ComponentMeta,
} from "./create-component";
// Component factory & registry
export { createComponent, isBuilderComponent } from "./create-component";
export { Canvas } from "./editor/canvas";
export type { EditorProps } from "./editor/editor";
export { Editor } from "./editor/editor";
export type { SchemaFormProps } from "./editor/form-fields/schema-form";
// Schema-based form (Radix UI)
export { SchemaForm } from "./editor/form-fields/schema-form";
// Helpers (for advanced usage)
export { componentToJsx, getImports } from "./helpers/editor.helper";
export type { TreeItemData } from "./helpers/tree.helper";
export {
  deleteComponentWithChildren,
  flatTreeToNested,
  getComponentChildren,
  getComponentDepth,
  getOrderedList,
  nestedTreeToFlat,
} from "./helpers/tree.helper";
export { ComponentRegistry, createRegistry } from "./registry";
export type {
  BooleanFieldDescriptor,
  EnumFieldDescriptor,
  FieldType,
  FormFieldDescriptor,
  NumberFieldDescriptor,
  StringFieldDescriptor,
  UnsupportedFieldDescriptor,
} from "./schema-form";
// Schema introspection
export { introspectSchema } from "./schema-form";
// Types
export type {
  CanvasComponentList,
  ComponentData,
  ComponentTree,
  ExtendedComponent,
} from "./types/component";
