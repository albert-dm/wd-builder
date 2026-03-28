import * as Checkbox from "@radix-ui/react-checkbox";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import * as Label from "@radix-ui/react-label";
import * as Select from "@radix-ui/react-select";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import type { ZodObject } from "zod";
import { type FormFieldDescriptor, introspectSchema } from "../../schema-form";

// ─── Styles (inline for now, extractable to CSS module later) ────────────────

const fieldWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const inputStyle: React.CSSProperties = {
  padding: "0.375rem 0.5rem",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "0.875rem",
  width: "100%",
  boxSizing: "border-box",
};

const checkboxStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  border: "1px solid #ddd",
  borderRadius: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "white",
  cursor: "pointer",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
};

// ─── Individual field components ─────────────────────────────────────────────

interface FieldProps {
  field: FormFieldDescriptor;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
}

function StringField({ field, value, onChange }: FieldProps) {
  return (
    <div style={fieldWrapperStyle}>
      <Label.Root htmlFor={field.name} style={labelStyle}>
        {field.label}
      </Label.Root>
      <input
        id={field.name}
        type="text"
        style={inputStyle}
        value={typeof value === "string" ? value : ""}
        placeholder={field.required ? "Required" : "Optional"}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    </div>
  );
}

function NumberField({ field, value, onChange }: FieldProps) {
  if (field.type !== "number") return null;
  return (
    <div style={fieldWrapperStyle}>
      <Label.Root htmlFor={field.name} style={labelStyle}>
        {field.label}
        {field.min != null && field.max != null && (
          <span style={{ fontWeight: 400, color: "#999" }}>
            {" "}
            ({field.min}–{field.max})
          </span>
        )}
      </Label.Root>
      <input
        id={field.name}
        type="number"
        style={inputStyle}
        value={typeof value === "number" ? value : ""}
        min={field.min}
        max={field.max}
        onChange={(e) => onChange(field.name, Number(e.target.value))}
      />
    </div>
  );
}

function BooleanField({ field, value, onChange }: FieldProps) {
  const checked = Boolean(value);
  return (
    <div style={{ ...fieldWrapperStyle, ...rowStyle }}>
      <Checkbox.Root
        id={field.name}
        checked={checked}
        onCheckedChange={(val) => onChange(field.name, Boolean(val))}
        style={checkboxStyle}
      >
        <Checkbox.Indicator>
          <CheckIcon />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <Label.Root
        htmlFor={field.name}
        style={{ ...labelStyle, cursor: "pointer" }}
      >
        {field.label}
      </Label.Root>
    </div>
  );
}

function EnumField({ field, value, onChange }: FieldProps) {
  if (field.type !== "enum") return null;
  return (
    <div style={fieldWrapperStyle}>
      <Label.Root htmlFor={field.name} style={labelStyle}>
        {field.label}
      </Label.Root>
      <Select.Root
        value={typeof value === "string" ? value : undefined}
        onValueChange={(val) => onChange(field.name, val)}
      >
        <Select.Trigger
          id={field.name}
          style={{
            ...inputStyle,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            background: "white",
          }}
        >
          <Select.Value placeholder="Select..." />
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            style={{
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxShadow: "0 4px 12px rgba(0,0,0,.1)",
              zIndex: 1000,
            }}
          >
            <Select.ScrollUpButton
              style={{ display: "flex", justifyContent: "center", padding: 4 }}
            >
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            <Select.Viewport style={{ padding: 4 }}>
              {field.options.map((opt) => (
                <Select.Item
                  key={opt}
                  value={opt}
                  style={{
                    padding: "0.375rem 0.5rem",
                    borderRadius: "2px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    outline: "none",
                  }}
                >
                  <Select.ItemText>{opt}</Select.ItemText>
                  <Select.ItemIndicator>
                    <CheckIcon />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton
              style={{ display: "flex", justifyContent: "center", padding: 4 }}
            >
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

function FieldRenderer({ field, value, onChange }: FieldProps) {
  switch (field.type) {
    case "string":
      return <StringField field={field} value={value} onChange={onChange} />;
    case "number":
      return <NumberField field={field} value={value} onChange={onChange} />;
    case "boolean":
      return <BooleanField field={field} value={value} onChange={onChange} />;
    case "enum":
      return <EnumField field={field} value={value} onChange={onChange} />;
    case "unsupported":
      return null; // Don't render unsupported fields
    default:
      return null;
  }
}

// ─── SchemaForm component ────────────────────────────────────────────────────

export interface SchemaFormProps {
  /** The Zod schema to generate the form from */
  // biome-ignore lint/suspicious/noExplicitAny: ZodObject requires any for generic schema types
  schema: ZodObject<any>;
  /** Current prop values */
  values: Record<string, unknown>;
  /** Called when any field value changes */
  onChange: (values: Record<string, unknown>) => void;
}

/**
 * Auto-generated form from a Zod schema.
 * Introspects the schema to determine field types and renders
 * appropriate Radix UI form controls for each editable field.
 */
export function SchemaForm({ schema, values, onChange }: SchemaFormProps) {
  const [fields, setFields] = useState<FormFieldDescriptor[]>([]);

  useEffect(() => {
    setFields(introspectSchema(schema));
  }, [schema]);

  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      onChange({ ...values, [name]: value });
    },
    [values, onChange],
  );

  if (fields.length === 0) {
    return (
      <div style={{ color: "#999", fontSize: "0.75rem", padding: "0.5rem" }}>
        No editable properties
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        width: "100%",
        padding: "0.5rem 0",
      }}
    >
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={values[field.name]}
          onChange={handleFieldChange}
        />
      ))}
    </div>
  );
}
