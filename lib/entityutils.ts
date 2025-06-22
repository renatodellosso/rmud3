import locations from "./locations";
import { AbilityWithSource } from "./types/Ability";
import { CreatureInstance } from "./types/entities/creature";
import { EntityInstance } from "./types/entity";
import { Targetable } from "./types/types";
import { getFromOptionalFunc } from "./utils";

export function selectRandomAbility(
  creature: CreatureInstance
): AbilityWithSource | undefined {
  const abilities = creature.getAbilities().filter((a) => {
    return (
      getValidTargets(creature, a).length >=
      getFromOptionalFunc(a.ability.getTargetCount, creature, a.source)
    );
  });

  if (abilities.length === 0) {
    return undefined;
  }

  const randomIndex = Math.floor(Math.random() * abilities.length);
  return abilities[randomIndex];
}

export function getValidTargets(
  creature: CreatureInstance,
  ability: AbilityWithSource
): Targetable[] {
  const location = locations[creature.location];
  const potentialTargets = (
    Array.from(location.entities) as Targetable[]
  ).concat(location);

  return potentialTargets.filter((target) =>
    getFromOptionalFunc(
      ability.ability.canTarget,
      creature,
      target,
      ability.source
    )
  );
}

export function selectRandomTargets(
  creature: CreatureInstance,
  ability: AbilityWithSource
): Targetable[] {
  const validTargets = getValidTargets(creature, ability);
  const targetCount = getFromOptionalFunc(
    ability.ability.getTargetCount,
    creature,
    ability.source
  );

  if (validTargets.length <= targetCount) {
    return validTargets;
  }

  const selectedTargets: Targetable[] = [];
  while (selectedTargets.length < targetCount) {
    const randomIndex = Math.floor(Math.random() * validTargets.length);
    const [target] = validTargets.splice(randomIndex, 1);
    selectedTargets.push(target);
  }

  return selectedTargets;
}

export function activateAbilityOnTick(
  instance: CreatureInstance,
  deltaTime: number,
  abilitySelector: (
    creature: CreatureInstance
  ) => AbilityWithSource | undefined,
  skipIfLocationIsEmpty = true
) {
  if (instance.canActAt > new Date()) {
    return;
  }

  const location = locations[instance.location];

  if (skipIfLocationIsEmpty && location.entities.size <= 1) {
    return;
  }

  const ability = abilitySelector(instance);
  if (!ability) {
    return;
  }

  const targets = selectRandomTargets(instance, ability);
  instance.activateAbility(ability.ability, targets, ability.source);
}

export function chanceToMoveRandomly(
  entity: EntityInstance,
  chance: number
): boolean {
  if (Math.random() < chance) {
    entity.moveToRandomLocation();
    return true;
  }
  return false;
}

export function activateAbilityAndMoveRandomlyOnTick(
  abilityChance: number,
  abilitySelector: (
    creature: CreatureInstance
  ) => AbilityWithSource | undefined,
  moveChance: number
) {
  return (entity: EntityInstance, deltaTime: number) => {
    if (!(entity instanceof CreatureInstance)) {
      return;
    }

    if (Math.random() < abilityChance * deltaTime) {
      activateAbilityOnTick(entity, deltaTime, abilitySelector);
    }

    chanceToMoveRandomly(entity, moveChance * deltaTime);
  };
}
