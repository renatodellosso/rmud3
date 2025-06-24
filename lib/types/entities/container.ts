import { EntityId } from "lib/gamedata/entities";
import { LocationId } from "lib/gamedata/rawLocations";
import { EntityDefinition, EntityInstance } from "../entity";
import Inventory from "../Inventory";
import locations from "lib/locations";
import { getIo } from "lib/ClientFriendlyIo";

export class ContainerInstance extends EntityInstance {
  inventory: Inventory = undefined as unknown as Inventory;

  deleteIfEmpty: boolean = false;

  constructor(
    definitionId: EntityId = undefined as any,
    locationId: LocationId = undefined as any,
    name: string = undefined as any,
    inventory: Inventory = undefined as any,
    deleteIfEmpty: boolean = false
  ) {
    super(definitionId, locationId, name);

    this.inventory = inventory;
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
