import {
  ZodBoolean,
  ZodDefault,
  ZodEffects,
  ZodEnum,
  ZodLiteral,
  ZodNativeEnum,
  ZodNumber,
  type ZodObject,
  ZodOptional,
  ZodString,
  type ZodTypeAny,
  ZodUnion,
} from "zod";

// ─── Field descriptor types ──────────────────────────────────────────────────

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "unsupported";

export interface BaseFieldDescriptor {
  /** The prop name (key in the ZodObject) */
  name: string;
  /** Whether the field is optional/has a default */
  required: boolean;
  /** Default value if one exists on the schema */
  defaultValue?: unknown;
  /** Human-readable label derived from the field name */
  label: string;
}

export interface StringFieldDescriptor extends BaseFieldDescriptor {
  type: "string";
  /** Min length constraint, if present */
  minLength?: number;
  /** Max length constraint, if present */
  maxLength?: number;
}

export interface NumberFieldDescriptor extends BaseFieldDescriptor {
  type: "number";
  /** Minimum value constraint */
  min?: number;
  /** Maximum value constraint */
  max?: number;
}

export interface BooleanFieldDescriptor extends BaseFieldDescriptor {
  type: "boolean";
}

export interface EnumFieldDescriptor extends BaseFieldDescriptor {
  type: "enum";
  /** Available enum options */
  options: string[];
}

export interface UnsupportedFieldDescriptor extends BaseFieldDescriptor {
  type: "unsupported";
  /** Descriptive reason why the field is unsupported */
  reason: string;
}

export type FormFieldDescriptor =
  | StringFieldDescriptor
  | NumberFieldDescriptor
  | BooleanFieldDescriptor
  | EnumFieldDescriptor
  | UnsupportedFieldDescriptor;

// ─── Schema introspection ────────────────────────────────────────────────────

/**
 * Unwraps optional/default/effects wrappers to get the inner Zod type.
 * Returns the inner type and metadata about whether it was optional or had a default.
 */
function unwrapType(schema: ZodTypeAny): {
  inner: ZodTypeAny;
  isOptional: boolean;
  defaultValue?: unknown;
} {
  let current = schema;
  let isOptional = false;
  let defaultValue: unknown;

  // Keep unwrapping until we hit a concrete type
  while (true) {
    if (current instanceof ZodOptional) {
      isOptional = true;
      current = current._def.innerType;
    } else if (current instanceof ZodDefault) {
      isOptional = true;
      defaultValue = current._def.defaultValue();
      current = current._def.innerType;
    } else if (current instanceof ZodEffects) {
      // ZodEffects wraps refinements, transforms, etc.
      current = current._def.schema;
    } else {
      break;
    }
  }

  return { inner: current, isOptional, defaultValue };
}

/**
 * Extracts number range checks from a ZodNumber schema.
 */
function getNumberConstraints(schema: ZodNumber): {
  min?: number;
  max?: number;
} {
  const checks = schema._def.checks ?? [];
  let min: number | undefined;
  let max: number | undefined;

  for (const check of checks) {
    if (check.kind === "min") min = check.value;
    if (check.kind === "max") max = check.value;
  }

  return { min, max };
}

/**
 * Extracts string length checks from a ZodString schema.
 */
function getStringConstraints(schema: ZodString): {
  minLength?: number;
  maxLength?: number;
} {
  const checks = schema._def.checks ?? [];
  let minLength: number | undefined;
  let maxLength: number | undefined;

  for (const check of checks) {
    if (check.kind === "min") minLength = check.value;
    if (check.kind === "max") maxLength = check.value;
  }

  return { minLength, maxLength };
}

/**
 * Convert a camelCase field name to a human-readable label.
 * e.g. "containerType" → "Container Type", "fullWidth" → "Full Width"
 */
function nameToLabel(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/**
 * Set of Zod type names that represent non-editable props in the builder.
 * We skip `children` (React nodes) and function props (event handlers).
 */
const SKIP_TYPE_NAMES = new Set(["ZodFunction"]);

/**
 * Field names to always skip (not editable in the builder UI).
 */
const SKIP_FIELD_NAMES = new Set(["children", "className", "style", "ref"]);

/**
 * Introspect a single Zod field and produce a FormFieldDescriptor.
 */
function introspectField(
  name: string,
  schema: ZodTypeAny,
): FormFieldDescriptor | null {
  // Skip non-editable fields
  if (SKIP_FIELD_NAMES.has(name)) return null;

  const { inner, isOptional, defaultValue } = unwrapType(schema);
  const typeName = inner.constructor.name;

  // Skip function types (event handlers)
  if (SKIP_TYPE_NAMES.has(typeName)) return null;

  // Skip z.custom() — used for ReactNode, complex objects, etc.
  // z.custom() produces a ZodAny or ZodType with no specific type info
  if (typeName === "ZodAny") return null;

  const base: BaseFieldDescriptor = {
    name,
    required: !isOptional,
    defaultValue,
    label: nameToLabel(name),
  };

  if (inner instanceof ZodString) {
    return {
      ...base,
      type: "string",
      ...getStringConstraints(inner),
    };
  }

  if (inner instanceof ZodNumber) {
    return {
      ...base,
      type: "number",
      ...getNumberConstraints(inner),
    };
  }

  if (inner instanceof ZodBoolean) {
    return {
      ...base,
      type: "boolean",
    };
  }

  if (inner instanceof ZodEnum) {
    return {
      ...base,
      type: "enum",
      options: inner._def.values as string[],
    };
  }

  if (inner instanceof ZodNativeEnum) {
    const values = Object.values(inner._def.values as Record<string, string>);
    return {
      ...base,
      type: "enum",
      options: values.filter((v) => typeof v === "string"),
    };
  }

  if (inner instanceof ZodLiteral) {
    return {
      ...base,
      type: "enum",
      options: [String(inner._def.value)],
    };
  }

  if (inner instanceof ZodUnion) {
    // Try to extract literal values from union members
    const options = inner._def.options as ZodTypeAny[];
    const literals: string[] = [];
    for (const opt of options) {
      const { inner: unwrapped } = unwrapType(opt);
      if (unwrapped instanceof ZodLiteral) {
        literals.push(String(unwrapped._def.value));
      } else if (unwrapped instanceof ZodEnum) {
        literals.push(...(unwrapped._def.values as string[]));
      }
    }
    if (literals.length > 0) {
      return {
        ...base,
        type: "enum",
        options: literals,
      };
    }
  }

  return {
    ...base,
    type: "unsupported",
    reason: `Unsupported Zod type: ${typeName}`,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Introspect a ZodObject schema and return an array of form field descriptors.
 * Fields that are not editable in the builder (children, event handlers, etc.)
 * are automatically filtered out.
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   variant: z.enum(["primary", "secondary"]).optional(),
 *   label: z.string(),
 *   count: z.number().min(0).max(100),
 *   visible: z.boolean(),
 *   children: z.custom<React.ReactNode>(),
 * });
 *
 * const fields = introspectSchema(schema);
 * // Returns descriptors for: variant(enum), label(string), count(number), visible(boolean)
 * // Skips: children (ReactNode)
 * ```
 */
export function introspectSchema(
  // biome-ignore lint/suspicious/noExplicitAny: ZodObject requires any for generic schema types
  schema: ZodObject<any>,
): FormFieldDescriptor[] {
  const shape = schema.shape as Record<string, ZodTypeAny>;
  const result: FormFieldDescriptor[] = [];

  for (const [name, fieldSchema] of Object.entries(shape)) {
    const descriptor = introspectField(name, fieldSchema);
    if (descriptor) {
      result.push(descriptor);
    }
  }

  return result;
}
