import Ability, {
  AbilityWithSource,
  getAbilitySourceName,
} from "lib/types/Ability";
import { CreatureInstance } from "lib/types/entities/creature";
import { getFromOptionalFunc } from "lib/utils";

export default function AbilityDescription({
  abilityWithSource,
  creature,
}: {
  abilityWithSource: AbilityWithSource;
  creature: CreatureInstance;
}) {
  const ability = abilityWithSource.ability;
  const source = abilityWithSource.source;

  return (
    <div>
      <h2 className="underline">{ability.name}</h2>
      <div>Source: {getAbilitySourceName(source)}</div>
      <div>
        Cooldown: {getFromOptionalFunc(ability.getCooldown, creature, source)}s
      </div>
      <div>
        Target Count:{" "}
        {getFromOptionalFunc(ability.getTargetCount, creature, source)}
      </div>
      <div>
        Description:{" "}
        {getFromOptionalFunc(ability.getDescription, creature, source)}
      </div>
    </div>
  );
}
