import items from "../gamedata/items";

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
  type?: EquipmentType;
};

export enum EquipmentType {}
