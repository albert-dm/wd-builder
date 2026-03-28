import type React from "react";
import type { ZodObject } from "zod";

/**
 * A React component with optional builder metadata attached as static properties.
 * Components can carry a Zod schema for prop validation and default prop values.
 */
// biome-ignore lint/suspicious/noExplicitAny: WdComponent needs to accept any props shape
export type WdComponent<P = any> = React.FC<P> & {
  defaults?: Record<string, unknown>;
  // biome-ignore lint/suspicious/noExplicitAny: ZodObject requires any for generic schema types
  zodSchema?: ZodObject<any>;
};
