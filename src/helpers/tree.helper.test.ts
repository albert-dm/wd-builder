import { ComponentTree } from "../types/component";

const tree: ComponentTree = [
  {
    label: "Layout da Pagina",
    id: '0',
    droppable: true,
    data: {
      componentCollection: 'Layout',
      componentName: 'Section',
    }
  },
  {
    id: '1',
    parentId: '0',
    label: 'Stack',
    droppable: true,
    data: {
      componentCollection: 'Layout',
      componentName: 'Article',
    }
  },
  {
    id: '2',
    parentId: '1',
    label: 'First Button',
    droppable: true,
    data: {
      componentCollection: 'Custom',
      componentName: 'Button',
      props: {
        label: 'First Button'
      }
    }
  },
  {
    id: '3',
    parentId: '1',
    label: 'Second Button',
    droppable: true,
    data: {
      componentCollection: 'Custom',
      componentName: 'Button',
      props: {
        label: 'Second Button'
      }
    }
  },
  {
    id: '4',
    parentId: '1',
    label: 'Third Button',
    droppable: true,
    data: {
      componentCollection: 'Custom',
      componentName: 'Button',
      props: {
        label: 'Third Button'
      }
    }
  },
];