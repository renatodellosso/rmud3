import Ability, {
  AbilitySource,
  AbilityWithSource,
  getAbilitySourceName,
} from "lib/types/Ability";
import { GameState, Targetable } from "lib/types/types";
import { useEffect, useState } from "react";
import { getFromOptionalFunc, getTargetId } from "../../lib/utils";
import { socket } from "lib/socket";
import { isTargetACreature } from "lib/gamedata/CanTarget";

export default function CombatMenu({ gameState }: { gameState: GameState }) {
  const [targets, setTargets] = useState<Targetable[]>([]);
  const [selectedAbility, setSelectedAbility] = useState<AbilityWithSource>();
  const [targetCount, setTargetCount] = useState<number>(1);
  const [canAct, setCanAct] = useState<boolean>(true);

  function toggleTarget(target: Targetable) {
    const newTargets = targets.includes(target)
      ? targets.filter((t) => t !== target)
      : [...targets, target];

    if (newTargets.length !== targetCount) {
      setTargets(newTargets);
      return;
    }

    activateAbility(newTargets);
    setTargets([]);
  }

  function selectAbility(ability: Ability, source: AbilitySource) {
    setSelectedAbility({
      ability,
      source,
    });

    setTargets((prev) =>
      prev.filter((t) =>
        getFromOptionalFunc(ability.canTarget, gameState.self, t, source)
      )
    );

    setTargetCount(
      getFromOptionalFunc(ability.getTargetCount, gameState.self, source)
    );
  }

  function activateAbility(targets: Targetable[]) {
    console.log("Activating ability:", selectedAbility?.ability.name);
    if (!selectedAbility) {
      console.warn("No ability selected for activation.");
      return;
    }

    if (targets.length !== targetCount) {
      console.warn(
        `Cannot activate ${selectedAbility.ability.name}: expected ${targetCount} targets, but got ${targets.length}`
      );
      return;
    }

    const { ability, source } = selectedAbility;
    console.log(
      `Activating ability ${ability.name} on targets: ${targets
        .map((t) => t.name)
        .join(", ")}`
    );

    socket.emit(
      "activateAbility",
      ability.name,
      getAbilitySourceName(source),
      targets.map(getTargetId)
    );
  }

  useEffect(() => {
    const interval = setInterval(
      () => setCanAct(gameState.self.canActAt <= new Date()),
      25
    );

    return () => clearInterval(interval);
  }, [gameState]);

  return (
    <div className="border w-1/6 flex flex-col gap-2">
      <h2 className="text-xl">Combat</h2>
      <div>
        <h3>Abilities</h3>
        <div className="flex flex-col gap-1">
          {gameState.self.getAbilities().map((ability) => (
            <button
              key={ability.ability.name}
              onClick={() => selectAbility(ability.ability, ability.source)}
              className={`w-full px-1 ${
                selectedAbility?.ability.name === ability.ability.name &&
                selectedAbility?.source.definitionId ===
                  ability.source.definitionId
                  ? "bg-blue-500"
                  : ""
              }`}
            >
              {ability.ability.name} ({getAbilitySourceName(ability.source)})
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3>
          Targets ({targets.length}/{targetCount})
        </h3>
        <div className="flex flex-col gap-1">
          {Array.from(gameState.location.entities).map((entity) => (
            <button
              key={entity._id.toString()}
              onClick={() => toggleTarget(entity)}
              className={`w-full px-1 ${
                targets.map(getTargetId).includes(getTargetId(entity)) &&
                "bg-red-500 animate-pulse"
              } ${
                targets.length === targetCount - 1 && "animate-shake-on-hover"
              }`}
              disabled={
                !selectedAbility ||
                (selectedAbility?.ability.canTarget &&
                  !getFromOptionalFunc(
                    selectedAbility?.ability.canTarget,
                    gameState.self,
                    entity,
                    selectedAbility?.source
                  )) ||
                !canAct
              }
            >
              {entity.name}{" "}
              {isTargetACreature(undefined as any, entity) && (
                <>
                  ({entity.health}/{(entity.getMaxHealth as () => number)()})
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
