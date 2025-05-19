import { ItemDefinition } from "lib/types";

const items = Object.freeze({
  "test": {
    name: "Test Item",
  },
} satisfies Record<string, ItemDefinition>);

export default items;