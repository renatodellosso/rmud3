import { Location } from "./Location";
import { randInRangeInt, restoreFieldsAndMethods } from "../utils";
import { PlayerInstance, PlayerProgress } from "./entities/player";
import { EntityInstance, Interaction } from "./entity";
import { LocationId } from "lib/gamedata/rawLocations";
import LocationMap from "./LocationMap";
import items, { ItemId } from "lib/gamedata/items";
import { ItemDefinition, ItemInstance } from "./item";
import Guild, { ClientGuild } from "./Guild";

export type Targetable = EntityInstance | Location;

export class CannotDirectlyCreateInstanceError extends Error {
  constructor(className: string) {
    super(
      `Cannot create an instance of ${className} directly. Create it like an instance of a type and then call ${restoreFieldsAndMethods.name}`
    );
    this.name = "CannotDirectlyCreateInstanceError";
  }
}

export enum AbilityScore {
  Strength = "Strength",
  Constitution = "Constitution",
  Intelligence = "Intelligence",
}

/**
 * Allows for either a value or a function that returns a value of the same type.
 * Ex: string | ((...params: any[]) => string)
 */
export type OptionalFunc<TReturn, TParams extends any> =
  | TReturn
  | ((...params: TParams extends any[] ? TParams : [TParams]) => TReturn);

type FlagExcludedType<Base, Type> = {
  [Key in keyof Base]: Base[Key] extends Type ? never : Key;
};

type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];

export type OmitType<Base, Type> = Pick<Base, AllowedNames<Base, Type>>;

export type SerializedEJSON<T> = string;

export type PlayerSave = {
  instance: PlayerInstance;
  progress: PlayerProgress;
};

export type Point = [number, number];
export type Range = [number, number];

export type ExitData = {
  name: string;
  id: LocationId;
};

export type GameState = {
  self: PlayerInstance;
  progress: PlayerProgress;
  location: OmitType<Omit<Location, "entities" | "exits">, Function> & {
    entities: (EntityInstance & { interactable: boolean })[];
    exits: ExitData[];
  };
  messages: string[];
  interactions: Interaction[];
  map: LocationMap;
  guild: ClientGuild | undefined;
};

export enum DamageType {
  Slashing = "Slashing",
  Piercing = "Piercing",
  Bludgeoning = "Bludgeoning",
  Psychic = "Psychic",
  Fire = "Fire",
  Poison = "Poison",
}

type WeightedTableEntry<T> = {
  item: T;
  amount: Range | number;
  weight: number;
};

export class WeightedTable<T> {
  public items: (WeightedTableEntry<T> & {
    upperBound: number;
  })[] = [];

  public totalWeight: number = 0;

  constructor(items: WeightedTableEntry<T>[]) {
    this.add(...items);
  }

  add(...items: WeightedTableEntry<T>[]) {
    for (const item of items) {
      const upperBound = this.totalWeight + item.weight;
      this.items.push({ ...item, upperBound });
      this.totalWeight = upperBound;
    }
  }

  /**
   * Get a random item from the table
   */
  roll(): { item: T; amount: number } {
    if (this.items.length === 0) {
      throw new Error("Cannot roll on an empty weighted table");
    }

    const roll = Math.random() * this.totalWeight;

    for (const item of this.items) {
      if (roll < item.upperBound) {
        const amount =
          typeof item.amount === "number"
            ? item.amount
            : randInRangeInt(item.amount[0], item.amount[1]);
        return { item: item.item, amount };
      }
    }

    throw new Error("No item found in weighted table, this should not happen");
  }
}

type LootTableEntry = {
  item: WeightedTable<ItemId>;
  amount: number;
  chance: number;
};

export class LootTable {
  public entries: LootTableEntry[];

  constructor(entries: LootTableEntry[]) {
    this.entries = entries;
  }

  roll(): ItemInstance[] {
    if (this.entries.length === 0) {
      throw new Error("Cannot roll on an empty loot table");
    }

    const roll = Math.random();

    let rolledItems: ItemInstance[] = [];

    for (const entry of this.entries) {
      for (let i = 0; i < entry.amount; i++) {
        if (Math.random() <= entry.chance) {
          let rolledItem = entry.item.roll();

          rolledItems.push({
            definitionId: rolledItem.item,
            amount: rolledItem.amount,
          });
        }
      }
    }

    return rolledItems;
  }
}

export type DamageWithType = {
  amount: number;
  type: DamageType;
};
