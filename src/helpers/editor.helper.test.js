import { blockToJsx } from "./editor.helper";

const treeData = [
  {
    id: 1,
    parent: 0,
    text: 'Stack',
    droppable: true,
    data: {
      componentName: 'Stack',
      align: 'start'
    }
  },
  {
    id: 2,
    parent: 1,
    text: 'Button',
    droppable: true,
    data: {
      componentName: 'Button',
      label: 'Test Button'
    }
  },
  {
    id: 3,
    parent: 1,
    text: 'Button',
    droppable: true,
    data: {
      componentName: 'Button',
      label: 'Example Button'
    }
  },
];

const rootComponentData = {
  text: "Layout da Pagina",
  id: 0,
  data: {
    componentName: 'Container'
  }
}

describe('Testing Editor Helper', () => {
  test('Should be able to extract JSX from Tree object', () => {
    const expectedJsx = 
`<Container>
  <Stack align="start">
    <Button label="Test Button">
    </Button>
    <Button label="Example Button">
    </Button>
  </Stack>
</Container>
`;
    const result = blockToJsx(rootComponentData, treeData);

    expect(result).toMatch(expectedJsx)
  })
})