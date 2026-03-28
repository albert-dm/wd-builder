import { describe, expect, test } from "vitest";
import { z } from "zod";
import {
  type BuilderComponent,
  createComponent,
  isBuilderComponent,
} from "./create-component";

const DummyFC = ({ label: _label }: { label: string }) => null;

const DummySchema = z.object({
  label: z.string(),
  count: z.number().optional(),
});

describe("createComponent", () => {
  test("creates a BuilderComponent with defaults and schema", () => {
    const result = createComponent({
      component: DummyFC,
      schema: DummySchema,
      defaults: { label: "Hello" },
      droppable: true,
      meta: { category: "Content", description: "A test component" },
    });

    expect(result.zodSchema).toBe(DummySchema);
    expect(result.defaults).toEqual({ label: "Hello" });
    expect(result.droppable).toBe(true);
    expect(result.meta.category).toBe("Content");
    expect(result.meta.description).toBe("A test component");
  });

  test("defaults droppable to false", () => {
    const result = createComponent({ component: DummyFC });
    expect(result.droppable).toBe(false);
  });

  test("defaults meta to empty object", () => {
    const result = createComponent({ component: DummyFC });
    expect(result.meta).toEqual({});
  });

  test("falls back to component.zodSchema when no explicit schema given", () => {
    const Comp = Object.assign(DummyFC, { zodSchema: DummySchema });
    const result = createComponent({ component: Comp });
    expect(result.zodSchema).toBe(DummySchema);
  });

  test("explicit schema overrides component.zodSchema", () => {
    const otherSchema = z.object({ name: z.string() });
    const Comp = Object.assign(({ label: _label }: { label: string }) => null, {
      zodSchema: DummySchema,
    });
    const result = createComponent({ component: Comp, schema: otherSchema });
    expect(result.zodSchema).toBe(otherSchema);
  });

  test("falls back to component.defaults when no explicit defaults given", () => {
    const Comp = Object.assign(({ label: _label }: { label: string }) => null, {
      defaults: { label: "Default" },
    });
    const result = createComponent({ component: Comp });
    expect(result.defaults).toEqual({ label: "Default" });
  });

  test("explicit defaults override component.defaults", () => {
    const Comp = Object.assign(({ label: _label }: { label: string }) => null, {
      defaults: { label: "Original" },
    });
    const result = createComponent({
      component: Comp,
      defaults: { label: "Override" },
    });
    expect(result.defaults).toEqual({ label: "Override" });
  });

  test("does not mutate the original component", () => {
    const original = ({ label: _label }: { label: string }) => null;
    createComponent({
      component: original,
      schema: DummySchema,
      droppable: true,
    });
    // Original should not have builder metadata
    expect((original as BuilderComponent).droppable).toBeUndefined();
  });

  test("preserves displayName", () => {
    const Named = ({ label: _label }: { label: string }) => null;
    Named.displayName = "MyComponent";
    const result = createComponent({ component: Named });
    expect(result.displayName).toBe("MyComponent");
  });

  test("created component is callable as a function", () => {
    const result = createComponent({
      component: DummyFC,
      schema: DummySchema,
      defaults: { label: "Hello" },
    });
    // Should not throw
    expect(result({ label: "test" })).toBeNull();
  });
});

describe("isBuilderComponent", () => {
  test("returns true for BuilderComponent", () => {
    const bc = createComponent({ component: DummyFC });
    expect(isBuilderComponent(bc)).toBe(true);
  });

  test("returns false for plain ExtendedComponent", () => {
    const plain = Object.assign(DummyFC, {});
    expect(isBuilderComponent(plain)).toBe(false);
  });
});
