import Ability, {
  AbilitySource,
  AbilityWithSource,
  getAbilitySourceName,
} from "lib/types/Ability";
import { GameState, Targetable } from "lib/types/types";
import { useEffect, useRef, useState } from "react";
import { getFromOptionalFunc, getTargetId } from "../../lib/utils";
import { socket } from "lib/socket";
import { isTargetACreature } from "lib/gamedata/CanTarget";
import AbilityTooltip from "../AbilityTooltip";
import { Location } from "lib/types/Location";
import { EntityInstance } from "lib/types/entity";
import statusEffects from "lib/gamedata/statusEffects";
import StatusEffectList from "../StatusEffectList";

export default function CombatMenu({ gameState }: { gameState: GameState }) {
  const [targets, setTargets] = useState<Targetable[]>([]);
  const [selectedAbility, setSelectedAbility] = useState<AbilityWithSource>();
  const [targetCount, setTargetCount] = useState<number>(1);
  const [canAct, setCanAct] = useState<boolean>(true);
  const cooldownRef = useRef<HTMLDivElement>(null);

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
    const interval = setInterval(() => {
      setCanAct(gameState.self.canActAt <= new Date());
    }, 100);

    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!cooldownRef.current) return;

      const canAct = gameState.self.canActAt <= new Date();
      if (canAct) {
        cooldownRef.current.innerText = "Can act now!";
      } else {
        const timeLeftSecs =
          Math.max(
            0,
            gameState.self.canActAt.getTime() - new Date().getTime()
          ) / 1000;

        cooldownRef.current.innerText = `Can act in ${timeLeftSecs.toFixed(
          1
        )}s`;
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.self.canActAt]);

  return (
    <div className="border w-1/6 flex flex-col gap-2">
      <h2 className="text-xl">Combat</h2>
      <div ref={cooldownRef}>
        Can act in{" "}
        {(
          Math.max(
            0,
            gameState.self.canActAt.getTime() - new Date().getTime()
          ) / 1000
        ).toFixed(1)}
        s
      </div>
      <div>
        <strong>Abilities</strong>
        <div className="flex flex-col gap-1">
          {gameState.self.getAbilities().map((ability) => (
            <button
              key={ability.ability.name}
              onClick={() => selectAbility(ability.ability, ability.source)}
              className={`tooltip w-full px-1 ${
                selectedAbility?.ability.name === ability.ability.name &&
                selectedAbility?.source.definitionId ===
                  ability.source.definitionId
                  ? "bg-blue-500"
                  : ""
              }`}
            >
              {ability.ability.name} ({getAbilitySourceName(ability.source)})
              <AbilityTooltip
                abilityWithSource={ability}
                creature={gameState.self}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <strong>
          Targets ({targets.length}/{targetCount})
        </strong>
        <div className="flex flex-col gap-1">
          {(Array.from(gameState.location.entities) as Targetable[])
            .concat([gameState.location as any as Location])
            .map((target) => (
              <button
                key={"_id" in target ? target._id.toString() : target.id}
                onClick={() => toggleTarget(target)}
                className={`w-full px-1 ${
                  targets.map(getTargetId).includes(getTargetId(target)) &&
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
                      target,
                      selectedAbility?.source
                    )) ||
                  !canAct
                }
              >
                {target.name}{" "}
                {isTargetACreature(undefined as any, target) && (
                  <>
                    ({target.health.toFixed()}/
                    {(target.getMaxHealth as () => number)().toFixed()})
                  </>
                )}
              </button>
            ))}
        </div>
      </div>
      <StatusEffectList effects={gameState.self.statusEffects} />
    </div>
  );
}
