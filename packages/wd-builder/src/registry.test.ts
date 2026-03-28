import { describe, expect, test } from "vitest";
import { z } from "zod";
import { createComponent } from "./create-component";
import { ComponentRegistry, createRegistry } from "./registry";

const DummySchema = z.object({ label: z.string() });

function makeDummy(name: string) {
  return createComponent({
    component: Object.assign(({ label: _label }: { label: string }) => null, {
      displayName: name,
    }),
    schema: DummySchema,
    defaults: { label: name },
    droppable: false,
  });
}

describe("ComponentRegistry", () => {
  test("register and get a component", () => {
    const registry = createRegistry();
    const btn = makeDummy("Button");
    registry.register("Layout", "Button", btn);

    expect(registry.get("Layout", "Button")).toBe(btn);
  });

  test("returns undefined for unknown component", () => {
    const registry = createRegistry();
    expect(registry.get("Nope", "Nothing")).toBeUndefined();
  });

  test("register is chainable", () => {
    const registry = createRegistry();
    const result = registry
      .register("A", "One", makeDummy("One"))
      .register("A", "Two", makeDummy("Two"));

    expect(result).toBe(registry);
  });

  test("registerCollection registers multiple at once", () => {
    const registry = createRegistry();
    const btn = makeDummy("Button");
    const input = makeDummy("Input");

    registry.registerCollection("UI", { Button: btn, Input: input });

    expect(registry.get("UI", "Button")).toBe(btn);
    expect(registry.get("UI", "Input")).toBe(input);
  });

  test("getCollection returns all components in a collection", () => {
    const registry = createRegistry();
    const btn = makeDummy("Button");
    const input = makeDummy("Input");

    registry.registerCollection("UI", { Button: btn, Input: input });

    const collection = registry.getCollection("UI");
    expect(collection).toEqual({ Button: btn, Input: input });
  });

  test("getCollection returns undefined for unknown collection", () => {
    const registry = createRegistry();
    expect(registry.getCollection("Unknown")).toBeUndefined();
  });

  test("toCanvasComponentList produces correct shape", () => {
    const registry = createRegistry();
    const btn = makeDummy("Button");
    const text = makeDummy("Text");

    registry
      .register("WdComponents", "Button", btn)
      .register("WdComponents", "Text", text)
      .register("Custom", "Button", makeDummy("CustomButton"));

    const list = registry.toCanvasComponentList();

    expect(Object.keys(list)).toEqual(["WdComponents", "Custom"]);
    expect(Object.keys(list.WdComponents)).toEqual(["Button", "Text"]);
    expect(Object.keys(list.Custom)).toEqual(["Button"]);
  });

  test("listAll returns flat array of all components", () => {
    const registry = createRegistry();
    registry
      .register("A", "One", makeDummy("One"))
      .register("A", "Two", makeDummy("Two"))
      .register("B", "Three", makeDummy("Three"));

    const all = registry.listAll();
    expect(all).toHaveLength(3);
    expect(all.map((c) => c.componentName)).toEqual(["One", "Two", "Three"]);
    expect(all.map((c) => c.collectionName)).toEqual(["A", "A", "B"]);
  });

  test("is iterable", () => {
    const registry = createRegistry();
    registry
      .register("A", "X", makeDummy("X"))
      .register("B", "Y", makeDummy("Y"));

    const items = [...registry];
    expect(items).toHaveLength(2);
    expect(items[0].componentName).toBe("X");
    expect(items[1].componentName).toBe("Y");
  });

  test("overwriting a component replaces it", () => {
    const registry = createRegistry();
    const v1 = makeDummy("v1");
    const v2 = makeDummy("v2");

    registry.register("A", "Btn", v1);
    registry.register("A", "Btn", v2);

    expect(registry.get("A", "Btn")).toBe(v2);
    expect(registry.listAll()).toHaveLength(1);
  });
});

describe("createRegistry", () => {
  test("returns a ComponentRegistry instance", () => {
    const registry = createRegistry();
    expect(registry).toBeInstanceOf(ComponentRegistry);
  });
});
