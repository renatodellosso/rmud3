import { ItemDefinition } from "lib/types/item";

const items = Object.freeze({
  test: {
    name: "Test Item",
    tags: [],
    description: "This is a test item.",
    weight: 1,
  },
  test2: {
    name: "Test Item 2",
    tags: [],
    description: "This is another test item.",
    weight: 2,
  },
} satisfies Record<string, ItemDefinition>);

export default items;
