import { CreatureInstance } from "./entities/creature";
import { PlayerInstance } from "./entities/player";

type PlayerEventListener = {
  onKill?: (player: PlayerInstance, creature: CreatureInstance) => void;
};

export default PlayerEventListener;
