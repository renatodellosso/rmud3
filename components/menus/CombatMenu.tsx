import Ability, {
  AbilitySource,
  AbilityWithSource,
  getAbilitySourceName,
} from "lib/types/Ability";
import { GameState, Targetable } from "lib/types/types";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { getFromOptionalFunc, getTargetId } from "../../lib/utils";
import { socket } from "lib/socket";
import { isTargetACreature } from "lib/gamedata/CanTarget";
import AbilityTooltip from "../AbilityTooltip";
import { Location } from "lib/types/Location";
import StatusEffectList from "../StatusEffectList";
import items, { ItemId } from "lib/gamedata/items";
import { ItemTag } from "lib/types/itemenums";
import { ItemInstance } from "lib/types/item";

function TargetEntry({
  target,
  toggleTarget,
  selectedAbility,
  gameState,
  targets,
  targetCount,
  canAct,
}: {
  target: Targetable;
  toggleTarget: (target: Targetable) => void;
  selectedAbility: AbilityWithSource | undefined;
  gameState: GameState;
  targets: Targetable[];
  targetCount: number;
  canAct: boolean;
}) {
  const isCreature = isTargetACreature(undefined as any, target);

  const style: CSSProperties = isCreature
    ? {
        borderImageSource: `linear-gradient(to right, red, red ${
          (target.health / target.getMaxHealth()) * 100
        }%, white 1rem, white 100%)`,
        borderImageSlice: 1,
      }
    : {};

  return (
    <button
      key={"_id" in target ? target._id.toString() : target.id}
      onClick={() => toggleTarget(target)}
      className={`w-full px-1 ${
        targets.map(getTargetId).includes(getTargetId(target)) &&
        "bg-red-500 animate-pulse"
      } ${targets.length === targetCount - 1 && "animate-shake-on-hover"}`}
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
      style={style}
    >
      {target.name}{" "}
      {isCreature && (
        <>
          (
          {(target.health > 0 && target.health < 1) ? "1" : target.health.toFixed()}
          /{(target.getMaxHealth as () => number)().toFixed()})
        </>
      )}
    </button>
  );
}

export default function CombatMenu({ gameState }: { gameState: GameState }) {
  const [targets, setTargets] = useState<Targetable[]>([]);
  const [selectedAbility, setSelectedAbility] = useState<AbilityWithSource>();
  const [targetCount, setTargetCount] = useState<number>(1);
  const [canAct, setCanAct] = useState<boolean>(true);

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [totalCooldown, setTotalCooldown] = useState<number>(0);

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
      if (selectedAbility?.source) {
        setCanAct(selectedAbility.source.canActAt <= new Date());
      }
      else setCanAct(gameState.self.canActAt <= new Date());
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, selectedAbility]);

  useEffect(() => {
    const interval = setInterval(
      () => {
        if (selectedAbility?.source) {
          setCooldownRemaining(
            Math.max(
              0,
              selectedAbility.source.canActAt.getTime() - new Date().getTime()
            ) / 1000
          );
        }
        else {
          setCooldownRemaining(
            Math.max(
              0,
              gameState.self.canActAt.getTime() - new Date().getTime()
            ) / 1000
          );
        }
      },
      25
    );

    return () => clearInterval(interval);
  }, [gameState.self.canActAt, selectedAbility?.source.canActAt]);

  useEffect(
    () => {
      if (selectedAbility?.source) {
        setTotalCooldown(
          (selectedAbility.source.canActAt.getTime() -
            selectedAbility.source.lastActedAt.getTime()) /
            1000
        );
      }
      else {
        setTotalCooldown(
          (gameState.self.canActAt.getTime() -
            gameState.self.lastActedAt.getTime()) /
            1000
        );
      }
    },
    [gameState.self, selectedAbility?.source]
  );

  return (
    <div className="border w-1/6 flex flex-col gap-2">
      <h2 className="text-xl">Combat</h2>
      <div>
        Can act{" "}
        {cooldownRemaining > 0 ? `in ${cooldownRemaining.toFixed(1)}s` : "now!"}
      </div>
      <div>
        <strong>Abilities</strong>
        <div className="flex flex-col gap-1">
          {gameState.self.getAbilities().map((ability) => (
            <button
              key={ability.ability.name}
              onClick={() => selectAbility(ability.ability, ability.source)}
              className={`tooltip w-full ${
                selectedAbility?.ability.name === ability.ability.name &&
                selectedAbility?.source.definitionId ===
                  ability.source.definitionId
                  ? "bg-blue-500"
                  : ""
              }`}
              style={
                selectedAbility?.ability.name === ability.ability.name &&
                selectedAbility?.source.definitionId ===
                  ability.source.definitionId
                  ? {
                      background: `linear-gradient(to right, green, green ${
                        (1 - cooldownRemaining / totalCooldown) * 100
                      }%, blue 1rem, blue 100%)`,
                    }
                  : {}
              }
            >
              {ability.ability.name} ({getAbilitySourceName(ability.source)})
              {items[ability.source.definitionId as ItemId]?.tags.includes(
                ItemTag.Consumable
              )
                ? ` (x${(ability.source as ItemInstance).amount})`
                : ""}
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
              <TargetEntry
                key={getTargetId(target)}
                target={target}
                toggleTarget={toggleTarget}
                selectedAbility={selectedAbility}
                gameState={gameState}
                targets={targets}
                targetCount={targetCount}
                canAct={canAct}
              />
            ))}
        </div>
      </div>
      <StatusEffectList effects={gameState.self.statusEffects} />
    </div>
  );
}
