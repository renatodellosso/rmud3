import Ability, {
  AbilitySource,
  CanTarget,
  getAbilitySourceName,
} from "lib/types/Ability";
import { GameState, Targetable } from "lib/types/types";
import { use, useEffect, useRef, useState } from "react";
import { getFromOptionalFunc, getTargetId } from "../../lib/utils";
import { socket } from "lib/socket";

export default function CombatMenu({ gameState }: { gameState: GameState }) {
  const [targets, setTargets] = useState<Targetable[]>([]);
  const [selectedAbility, setSelectedAbility] = useState<{
    ability: Ability;
    source: AbilitySource;
  }>();
  const [targetCount, setTargetCount] = useState<number>(1);
  const activateButtonRef = useRef<HTMLButtonElement>(null);

  function toggleTarget(target: Targetable) {
    setTargets((prevTargets) =>
      prevTargets.map(getTargetId).includes(getTargetId(target))
        ? prevTargets.filter((t) => getTargetId(t) !== getTargetId(target))
        : [...prevTargets, target]
    );
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

  function activateAbility() {
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
    const interval = setInterval(() => {
      if (!activateButtonRef.current) return;

      activateButtonRef.current.disabled =
        gameState.self.canActAt > new Date() || targets.length !== targetCount;
    }, 25);

    return () => clearInterval(interval);
  }, [gameState, targets, targetCount]);

  return (
    <div key="CombatMenu" className="border w-1/4 flex flex-col gap-2">
      <h2 className="text-xl">Combat</h2>
      <div>
        <h3>
          Targets ({targets.length}/{targetCount})
        </h3>
        <div className="flex gap-1">
          {Array.from(gameState.location.creatures).map((creature) => (
            <button
              key={creature._id.toString()}
              onClick={() => toggleTarget(creature)}
              className={`px-1 ${
                targets.map(getTargetId).includes(getTargetId(creature)) &&
                "bg-red-500 animate-pulse"
              }`}
              disabled={
                selectedAbility?.ability.canTarget &&
                !getFromOptionalFunc(
                  selectedAbility?.ability.canTarget,
                  gameState.self,
                  creature,
                  selectedAbility?.source
                )
              }
            >
              {creature.name} ({creature.health}/{creature.getMaxHealth()})
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3>Abilities</h3>
        <div>
          {gameState.self.getAbilities().map((ability) => (
            <button
              key={ability.ability.name}
              onClick={() => selectAbility(ability.ability, ability.source)}
              className={`px-1 ${
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
      {selectedAbility && (
        <button
          onClick={activateAbility}
          ref={activateButtonRef}
          className="w-full px-2 py-1 animate-shake-on-hover not-disabled:animate-pulse"
        >
          Activate {selectedAbility?.ability.name}
          {targets.length ? (
            ` on ${targets.map((t) => t.name).join(", ")}`
          ) : (
            <></>
          )}
        </button>
      )}
    </div>
  );
}
