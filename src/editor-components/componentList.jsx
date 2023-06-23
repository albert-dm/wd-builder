import React from "react";
import { Stack, Accordion, Button } from "@mantine/core"

export const ComponentList = ({ components, addComponent }) => {
  const handleComponentSelect = (componentName) => {
    addComponent(componentName, 0, componentName, {});
  }
  return <Stack>
    <Accordion chevronPosition="left" variant="filled">
      {
        Object.keys(components).map(
          collectionName =>
            <Accordion.Item key={collectionName} value={collectionName}>
              <Accordion.Control>{collectionName}</Accordion.Control>
              <Accordion.Panel>{Object.keys(components[collectionName]).map(
                componentName => <Button key={componentName} onClick={() => handleComponentSelect(componentName)}>{componentName}</Button>
              )}</Accordion.Panel>
            </Accordion.Item>
        )
      }
    </Accordion>
  </Stack>
}