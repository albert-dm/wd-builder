import { ComponentData, ComponentTree } from '../types';

export const componentToJsx = (component: ComponentData, tree: ComponentTree) => {
  const children = tree.filter(childBlock => childBlock.parent === component.id);

  const tab = component.id !== 0 && Number.isInteger(component.parent) ? Array(Number(component.parent) + 1).fill('  ').join('') : '';

  const propNames = Object.keys(component.data.props || {})
    .filter(attr => attr !== 'componentName')

  const attributeString = propNames
    .map(attr => `${attr}="${component.data.props?.[attr]}"`)
    .join(' ')

  let componentJsx = '';
  componentJsx += `${tab}<${component.data.componentName}`;
  if(propNames.length) componentJsx += ` ${attributeString}`;
  componentJsx += '>\n';
  children.forEach(component => {
    componentJsx += componentToJsx(component, tree);
  })
  componentJsx += `${tab}</${component.data.componentName}>\n`;
  return componentJsx;
}

export const getImports = (components: ComponentTree) => {
  const componentByCollection = components.reduce((acc, component) => {
    const { componentCollection, componentName } = component.data;
    if(!acc[componentCollection]) acc[componentCollection] = [];
    acc[componentCollection].push(componentName);
    return acc;
  }, {} as {[collection: string]: string[]});

  const imports = Object.keys(componentByCollection).map(collection => {
    const components = new Set(componentByCollection[collection]);
    return `const { ${Array.from(components).join(', ')} } = require('${collection}');\n`;
  }).join('\n');

  return imports;

  // const collectionNames = new Set(components.map(component => component.data.componentCollection));
  // const collections = Array.from(collectionNames).map(collection => {

  // });
  // const componentNames = new Set(components.map(component => component.data.componentName));
  // return `const { ${Array.from(componentNames).join(', ')} } = require('${blo}');\n\n`
}