import type React from "react";
import type { ZodObject } from "zod";
import type { ExtendedComponent } from "./types/component";

/**
 * Display metadata used by the builder UI (component menu, tooltips, etc.)
 */
export interface ComponentMeta {
  /** Icon shown in the component palette */
  icon?: React.ReactNode;
  /** Grouping category (e.g. "Layout", "Content", "Interactive") */
  category?: string;
  /** Human-readable description */
  description?: string;
}

/**
 * A component enhanced with all builder-specific metadata.
 * This extends ExtendedComponent so it's fully compatible with CanvasComponentList.
 */
// biome-ignore lint/suspicious/noExplicitAny: BuilderComponent must accept any props shape
export type BuilderComponent<P = any> = React.FC<P> & {
  defaults?: Record<string, unknown>;
  // biome-ignore lint/suspicious/noExplicitAny: ZodObject requires any for generic schema types
  zodSchema?: ZodObject<any>;
  /** Whether this component can contain children in the builder tree */
  droppable: boolean;
  /** Display metadata for the builder UI */
  meta: ComponentMeta;
};

/**
 * Input definition for `createComponent()`.
 *
 * If the provided `component` already has `zodSchema` or `defaults` attached
 * (e.g. a `WdComponent` from @webdrops/wd-ui), those are used as fallback.
 * Explicit `schema` / `defaults` in the definition take priority.
 */
export interface ComponentDefinition<P = Record<string, unknown>> {
  /** The React component to register in the builder */
  component: React.FC<P> & {
    defaults?: Record<string, unknown>;
    // biome-ignore lint/suspicious/noExplicitAny: ZodObject requires any for generic schema types
    zodSchema?: ZodObject<any>;
  };
  /** Zod schema for prop validation & form generation. Falls back to component.zodSchema */
  // biome-ignore lint/suspicious/noExplicitAny: ZodObject requires any for generic schema types
  schema?: ZodObject<any>;
  /** Default prop values. Falls back to component.defaults */
  defaults?: Partial<P>;
  /** Whether this component can contain children (default: false) */
  droppable?: boolean;
  /** Display metadata for the builder UI */
  meta?: ComponentMeta;
}

/**
 * Factory that creates a builder-ready component from a definition.
 *
 * @example
 * ```ts
 * import { Button } from "@webdrops/wd-ui";
 * import { createComponent } from "@webdrops/wd-builder";
 *
 * // Button already has .zodSchema and .defaults from wd-ui
 * const BuilderButton = createComponent({
 *   component: Button,
 *   droppable: true,
 *   meta: { category: "Interactive", description: "A clickable button" },
 * });
 * ```
 */
export function createComponent<P = Record<string, unknown>>(
  definition: ComponentDefinition<P>,
): BuilderComponent<P> {
  const {
    component,
    schema,
    defaults,
    droppable = false,
    meta = {},
  } = definition;

  // Clone the function reference to avoid mutating the original component
  const builderComponent = ((...args: [P]) =>
    component(...args)) as BuilderComponent<P>;

  // Copy over display name for devtools
  builderComponent.displayName =
    component.displayName || component.name || "BuilderComponent";

  // Schema: explicit > component.zodSchema
  const resolvedSchema = schema ?? component.zodSchema;
  if (resolvedSchema) {
    builderComponent.zodSchema = resolvedSchema;
  }

  // Defaults: explicit > component.defaults
  const resolvedDefaults =
    defaults != null
      ? (defaults as Record<string, unknown>)
      : component.defaults;
  if (resolvedDefaults) {
    builderComponent.defaults = resolvedDefaults;
  }

  builderComponent.droppable = droppable;
  builderComponent.meta = meta;

  return builderComponent;
}

/**
 * Type guard to check if a component is a BuilderComponent (has builder metadata).
 */
export function isBuilderComponent(
  component: ExtendedComponent,
): component is BuilderComponent {
  return "droppable" in component && "meta" in component;
}
