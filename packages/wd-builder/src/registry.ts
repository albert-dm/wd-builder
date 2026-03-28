import type { BuilderComponent } from "./create-component";
import type { CanvasComponentList, ExtendedComponent } from "./types/component";

/**
 * A registry that organizes components into named collections for the builder.
 *
 * @example
 * ```ts
 * import { createRegistry, createComponent } from "@webdrops/wd-builder";
 * import { Button, Section } from "@webdrops/wd-ui";
 *
 * const registry = createRegistry()
 *   .register("WdComponents", "Button", createComponent({ component: Button, droppable: true }))
 *   .register("WdComponents", "Section", createComponent({ component: Section, droppable: true }));
 *
 * // Pass to editor
 * <Editor components={registry.toCanvasComponentList()} />
 * ```
 */
export class ComponentRegistry {
  private collections = new Map<string, Map<string, BuilderComponent>>();

  /**
   * Register a single component under a collection name.
   * Returns `this` for chaining.
   */
  register(
    collectionName: string,
    componentName: string,
    component: BuilderComponent,
  ): this {
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, new Map());
    }
    // biome-ignore lint/style/noNonNullAssertion: we just created the map above
    this.collections.get(collectionName)!.set(componentName, component);
    return this;
  }

  /**
   * Register multiple components at once under a collection name.
   * Accepts a Record where keys are component names and values are BuilderComponents.
   */
  registerCollection(
    collectionName: string,
    components: Record<string, BuilderComponent>,
  ): this {
    for (const [name, component] of Object.entries(components)) {
      this.register(collectionName, name, component);
    }
    return this;
  }

  /**
   * Look up a single component by collection and name.
   */
  get(
    collectionName: string,
    componentName: string,
  ): BuilderComponent | undefined {
    return this.collections.get(collectionName)?.get(componentName);
  }

  /**
   * Get all components in a collection as a plain object.
   */
  getCollection(
    collectionName: string,
  ): Record<string, BuilderComponent> | undefined {
    const collection = this.collections.get(collectionName);
    if (!collection) return undefined;
    return Object.fromEntries(collection);
  }

  /**
   * Convert the registry into a `CanvasComponentList` for the editor.
   * BuilderComponent is a superset of ExtendedComponent, so the cast is safe.
   */
  toCanvasComponentList(): CanvasComponentList {
    const result: CanvasComponentList = {};
    for (const [collectionName, components] of this.collections) {
      result[collectionName] = Object.fromEntries(
        components,
      ) as unknown as Record<string, ExtendedComponent>;
    }
    return result;
  }

  /**
   * Get a flat list of all registered components with their collection/name.
   * Useful for building the component palette.
   */
  listAll(): Array<{
    collectionName: string;
    componentName: string;
    component: BuilderComponent;
  }> {
    const result: Array<{
      collectionName: string;
      componentName: string;
      component: BuilderComponent;
    }> = [];

    for (const [collectionName, components] of this.collections) {
      for (const [componentName, component] of components) {
        result.push({ collectionName, componentName, component });
      }
    }

    return result;
  }

  /**
   * Iterate over all components. Each yielded value includes collection name,
   * component name, and the BuilderComponent itself.
   */
  *[Symbol.iterator]() {
    for (const { collectionName, componentName, component } of this.listAll()) {
      yield { collectionName, componentName, component };
    }
  }
}

/**
 * Create a new empty ComponentRegistry.
 */
export function createRegistry(): ComponentRegistry {
  return new ComponentRegistry();
}
