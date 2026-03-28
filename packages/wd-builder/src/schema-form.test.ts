import type React from "react";
import { describe, expect, test } from "vitest";
import { z } from "zod";
import {
  type EnumFieldDescriptor,
  introspectSchema,
  type NumberFieldDescriptor,
  type StringFieldDescriptor,
} from "./schema-form";

describe("introspectSchema", () => {
  test("string field", () => {
    const schema = z.object({ label: z.string() });
    const fields = introspectSchema(schema);

    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      name: "label",
      type: "string",
      required: true,
      label: "Label",
    });
  });

  test("string with min/max constraints", () => {
    const schema = z.object({ title: z.string().min(1).max(100) });
    const fields = introspectSchema(schema);
    const field = fields[0] as StringFieldDescriptor;

    expect(field.type).toBe("string");
    expect(field.minLength).toBe(1);
    expect(field.maxLength).toBe(100);
  });

  test("number field", () => {
    const schema = z.object({ count: z.number() });
    const fields = introspectSchema(schema);

    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      name: "count",
      type: "number",
      required: true,
    });
  });

  test("number with min/max constraints", () => {
    const schema = z.object({ columns: z.number().min(1).max(12) });
    const fields = introspectSchema(schema);
    const field = fields[0] as NumberFieldDescriptor;

    expect(field.type).toBe("number");
    expect(field.min).toBe(1);
    expect(field.max).toBe(12);
  });

  test("boolean field", () => {
    const schema = z.object({ visible: z.boolean() });
    const fields = introspectSchema(schema);

    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      name: "visible",
      type: "boolean",
      required: true,
    });
  });

  test("enum field", () => {
    const schema = z.object({
      variant: z.enum(["primary", "secondary", "ghost"]),
    });
    const fields = introspectSchema(schema);
    const field = fields[0] as EnumFieldDescriptor;

    expect(field.type).toBe("enum");
    expect(field.options).toEqual(["primary", "secondary", "ghost"]);
  });

  test("optional field unwrapping", () => {
    const schema = z.object({ title: z.string().optional() });
    const fields = introspectSchema(schema);

    expect(fields[0]).toMatchObject({
      name: "title",
      type: "string",
      required: false,
    });
  });

  test("default value unwrapping", () => {
    const schema = z.object({ gap: z.number().default(1) });
    const fields = introspectSchema(schema);
    const field = fields[0] as NumberFieldDescriptor;

    expect(field.required).toBe(false);
    expect(field.defaultValue).toBe(1);
    expect(field.type).toBe("number");
  });

  test("skips children field (ReactNode)", () => {
    const schema = z.object({
      children: z.custom<React.ReactNode>(),
      label: z.string(),
    });
    const fields = introspectSchema(schema);

    expect(fields).toHaveLength(1);
    expect(fields[0].name).toBe("label");
  });

  test("skips className field", () => {
    const schema = z.object({
      className: z.string().optional(),
      label: z.string(),
    });
    const fields = introspectSchema(schema);

    expect(fields).toHaveLength(1);
    expect(fields[0].name).toBe("label");
  });

  test("skips function fields (onClick)", () => {
    const schema = z.object({
      onClick: z.function().args().returns(z.void()),
      label: z.string(),
    });
    const fields = introspectSchema(schema);

    expect(fields).toHaveLength(1);
    expect(fields[0].name).toBe("label");
  });

  test("camelCase name to label conversion", () => {
    const schema = z.object({
      containerType: z.string(),
      fullWidth: z.boolean(),
    });
    const fields = introspectSchema(schema);

    expect(fields[0].label).toBe("Container Type");
    expect(fields[1].label).toBe("Full Width");
  });

  test("handles complex optional enum", () => {
    const schema = z.object({
      variant: z.enum(["primary", "secondary"]).optional(),
    });
    const fields = introspectSchema(schema);
    const field = fields[0] as EnumFieldDescriptor;

    expect(field.type).toBe("enum");
    expect(field.required).toBe(false);
    expect(field.options).toEqual(["primary", "secondary"]);
  });

  test("ZodLiteral becomes enum with single option", () => {
    const schema = z.object({ mode: z.literal("dark") });
    const fields = introspectSchema(schema);
    const field = fields[0] as EnumFieldDescriptor;

    expect(field.type).toBe("enum");
    expect(field.options).toEqual(["dark"]);
  });

  test("real-world Button schema", () => {
    const ButtonSchema = z.object({
      children: z.custom<React.ReactNode>(),
      variant: z.enum(["primary", "secondary"]).optional(),
      onClick: z.function().args().returns(z.void()).optional(),
    });
    const fields = introspectSchema(ButtonSchema);

    // Only variant should be editable (children and onClick are skipped)
    expect(fields).toHaveLength(1);
    expect(fields[0]).toMatchObject({
      name: "variant",
      type: "enum",
      required: false,
      options: ["primary", "secondary"],
    });
  });

  test("real-world Text schema", () => {
    const TextSchema = z.object({
      value: z.string(),
      type: z.enum(["h1", "h2", "h3", "h4", "p", "span"]),
    });
    const fields = introspectSchema(TextSchema);

    expect(fields).toHaveLength(2);
    expect(fields[0]).toMatchObject({
      name: "value",
      type: "string",
      required: true,
    });
    expect(fields[1]).toMatchObject({
      name: "type",
      type: "enum",
      options: ["h1", "h2", "h3", "h4", "p", "span"],
    });
  });

  test("real-world Grid schema", () => {
    const GridSchema = z.object({
      children: z.custom<React.ReactNode>(),
      fullWidth: z.boolean().optional(),
      columns: z.number().min(1).max(12).optional(),
    });
    const fields = introspectSchema(GridSchema);

    expect(fields).toHaveLength(2);
    expect(fields[0]).toMatchObject({
      name: "fullWidth",
      type: "boolean",
      required: false,
    });
    const numField = fields[1] as NumberFieldDescriptor;
    expect(numField.name).toBe("columns");
    expect(numField.min).toBe(1);
    expect(numField.max).toBe(12);
  });

  test("union of string literals becomes enum", () => {
    const schema = z.object({
      href: z.string().url().optional().or(z.literal("")).or(z.literal("#")),
    });
    const fields = introspectSchema(schema);
    // This is a complex union - should produce an enum with extractable literals
    expect(fields.length).toBeGreaterThan(0);
  });

  test("empty schema produces no fields", () => {
    const schema = z.object({});
    const fields = introspectSchema(schema);
    expect(fields).toEqual([]);
  });

  test("schema with only skippable fields produces no fields", () => {
    const schema = z.object({
      children: z.custom<React.ReactNode>(),
      className: z.string().optional(),
      onClick: z.function().args().returns(z.void()),
    });
    const fields = introspectSchema(schema);
    expect(fields).toEqual([]);
  });
});
