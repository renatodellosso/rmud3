import { CreatureInstance } from "./creature";

export type Location = {
  name: string;
};

export type Targetable = CreatureInstance | Location;