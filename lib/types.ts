import creatures from './gamedata/creatures';
import items from './gamedata/items';
import locations from './gamedata/locations';

export type Location = {
  name: string;
}

export type CreatureDefinition = {
  name: string;

  baseHealth: number;
}

export type CreatureInstance = {
  id: keyof typeof creatures;

  name: string;
  location: keyof typeof locations;

  health: number;
}

export type PlayerInstance = CreatureInstance & {
}

export type Targetable = CreatureInstance | Location;

export type ItemDefinition = {
  name: string;
}

export type ItemInstance = {
  id: keyof typeof items;
  amount: number;
}

export class Inventory {
  items: ItemInstance[] = [];

  add(item: ItemInstance) {
  }
}