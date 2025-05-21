import items from "../gamedata/items";
import Ability from "./Ability";

export type ItemDefinition = {
  name: string;
  tags: ItemTag[];
  description: string;
  weight: number;
};

export type ItemInstance = {
  definitionId: keyof typeof items;
  amount: number;
};

export enum ItemTag {}

export type EquipmentDefinition = ItemDefinition & {
  slot?: EquipmentSlot;
  abilities?: Ability[];
};

export enum EquipmentSlot {}
