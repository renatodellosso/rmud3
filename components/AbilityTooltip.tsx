import { AbilityWithSource, getAbilitySourceName } from "lib/types/Ability";
import { CreatureInstance } from "lib/types/entities/creature";
import { getFromOptionalFunc } from "lib/utils";
import AbilityDescription from "./AbilityDescription";

export default function AbilityTooltip(props: {
  abilityWithSource: AbilityWithSource;
  creature: CreatureInstance;
}) {
  return (
    <div className="tooltip-text w-64 text-white text-left">
      <AbilityDescription {...props} />
    </div>
  );
}
