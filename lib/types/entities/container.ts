import { EntityId } from "lib/gamedata/entities";
import { LocationId } from "lib/gamedata/rawLocations";
import { EntityDefinition, EntityInstance } from "../entity";
import Inventory, { DirectInventory } from "../Inventory";
import locations from "lib/locations";
import { getIo } from "lib/ClientFriendlyIo";
import { ItemInstance } from "../item";

export class ContainerInstance extends EntityInstance {
  inventory: Inventory = undefined as unknown as Inventory;

  deleteIfEmpty: boolean = false;

  constructor(
    locationId: LocationId = undefined as any,
    name: string = undefined as any,
    inventory: Inventory | ItemInstance[] = undefined as any,
    deleteIfEmpty: boolean = false
  ) {
    super("container", locationId, name);

    if (Array.isArray(inventory)) {
      inventory = new DirectInventory(inventory);
    }

    this.inventory = inventory ?? new DirectInventory();
    this.deleteIfEmpty = deleteIfEmpty;
  }

  tick(deltaTime: number): void {
    super.tick(deltaTime);

    // If the container is empty and deleteIfEmpty is true, delete the container
    if (this.deleteIfEmpty && this.inventory.getItems().length === 0) {
      locations[this.location].entities.delete(this);
      getIo().updateGameStateForRoom(this.location);
    }
  }
}
