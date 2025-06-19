import { EntityId } from "lib/gamedata/entities";
import { LocationId } from "lib/gamedata/rawLocations";
import { EntityDefinition, EntityInstance } from "../entity";
import Inventory from "../Inventory";

export type ContainerDefinition = EntityDefinition & {
  inventory: Inventory;
};

export class ContainerInstance extends EntityInstance {
  inventory: Inventory = undefined as unknown as Inventory;

  constructor(
    definitionId: EntityId = undefined as any,
    locationId: LocationId = undefined as any,
    name: string = undefined as any,
    inventory: Inventory = undefined as any
  ) {
    super(definitionId, locationId, name);

    if (!inventory) return;

    this.inventory = inventory;
  }
}
