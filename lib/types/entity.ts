import entities, { EntityId } from "lib/gamedata/entities";
import { ObjectId } from "bson";
import locations from "lib/locations";
import { savePlayer } from "lib/utils";
import { PlayerInstance } from "./entities/player";
import { LocationId } from "lib/gamedata/rawLocations";
import Recipe, { RecipeGroup } from "./Recipe";
import Inventory from "./Inventory";
import { ItemInstance } from "./item";
import { DungeonLocation, FloorInstance } from "lib/dungeongeneration/types";
import { activateAbilityOnTick } from "lib/entityutils";
import { CreatureInstance } from "./entities/creature";
import { AbilityWithSource } from "./Ability";

export type EntityDefinition = {
  name: string;
  /**
   * @param deltaTime in seconds
   */
  tick?: (entity: EntityInstance, deltaTime: number) => void;
  /**
   * @param interaction the previous interaction, if any. Will be undefined if this is the first interaction.
   * @returns the new interaction. Return undefined to end the interaction.
   */
  interact?: (
    entity: EntityInstance,
    player: PlayerInstance,
    interaction: Interaction | undefined,
    action: any
  ) => Promise<Interaction | undefined>;
  canInteract?: (entity: EntityInstance, player: PlayerInstance) => boolean;
};

export class EntityInstance {
  _id: ObjectId = new ObjectId();

  definitionId: EntityId = undefined as unknown as EntityId;

  name: string = undefined as unknown as string;
  location: LocationId = undefined as unknown as LocationId;

  constructor(
    definitionId: EntityId = undefined as any,
    locationId: LocationId = undefined as any,
    name: string = undefined as any
  ) {
    this.location = locationId;
    this.name = name;

    this.definitionId = definitionId;
    const definition = entities[definitionId];
    if (!definition) {
      return;
    }

    this.name ??= definition.name;
  }

  tick(deltaTime: number) {
    entities[this.definitionId].tick?.(this, deltaTime);
  }

  move(newLocationId: LocationId) {
    if (!locations[newLocationId]) {
      throw new Error(`Invalid location ID: ${newLocationId}`);
    }

    const currentLocation = locations[this.location];
    if (!currentLocation.exits.has(newLocationId)) {
      throw new Error(
        `Cannot move to ${newLocationId} from ${this.location}. No exit available.`
      );
    }

    currentLocation.exit(this);
    const newLocation = locations[newLocationId];
    newLocation.enter(this);

    if (this.definitionId === "player") {
      savePlayer(this as unknown as PlayerInstance);
    }

    console.log(
      `Creature ${this.name} moved from ${currentLocation.name} to ${this.location}.`
    );
  }

  moveToRandomLocation(canChangeDepths = false) {
    const location = locations[this.location];

    const validExits = Array.from(location.exits).filter((exit) => {
      if (canChangeDepths) return true;

      const targetLocation = locations[exit];
      if (!targetLocation)
        throw new Error(
          `Invalid exit: ${exit} (comes from location ${location.id})`
        );
      if ("floor" in targetLocation != "floor" in location) return false;
      if (!("floor" in targetLocation)) return true;

      return (
        (targetLocation.floor as FloorInstance).depth ===
        ((location as DungeonLocation).floor as FloorInstance).depth
      );
    });

    if (validExits.length === 0) {
      return;
    }

    const randomExit =
      validExits[Math.floor(Math.random() * validExits.length)];

    this.move(randomExit);
  }
}

export type Interaction = {
  entityId: ObjectId;
  type: "logOnly" | "crafting" | "container" | "reforge";
  state?: any;
  actions?: { id: string; text: string }[];
  title?: string;
  recipes?: Recipe[];
  inventory?: Inventory;
};
