import locations from "./locations";
import Ability, { AbilitySource, AbilityWithSource } from "./types/Ability";
import { CreatureInstance } from "./types/creature";
import { LocationId } from "./types/Location";
import { PlayerInstance } from "./types/player";
import { Targetable } from "./types/types";
import { getFromOptionalFunc, savePlayer } from "./utils";
import { getIo } from "./ClientFriendlyIo";

export function moveCreature(
  creature: CreatureInstance,
  newLocationId: LocationId
) {
  if (!locations[newLocationId]) {
    throw new Error(`Invalid location ID: ${newLocationId}`);
  }

  const currentLocation = locations[creature.location];
  if (!currentLocation.exits.has(newLocationId)) {
    throw new Error(
      `Cannot move to ${newLocationId} from ${creature.location}. No exit available.`
    );
  }

  currentLocation.exit(creature);
  const newLocation = locations[newLocationId];
  newLocation.enter(creature);

  if (creature.definitionId === "player") {
    savePlayer(creature as PlayerInstance);
  }

  console.log(
    `Creature ${creature.name} moved from ${currentLocation.name} to ${creature.location}.`
  );
}

export function activateAbility(
  ability: Ability,
  creature: CreatureInstance,
  targets: Targetable[],
  source: AbilitySource
) {
  const msg = ability.activate(creature, targets, source);

  const location = locations[creature.location];

  creature.lastActedAt = new Date();
  creature.canActAt = new Date();

  creature.canActAt.setSeconds(
    creature.canActAt.getSeconds() +
      getFromOptionalFunc(ability.getCooldown, creature, source)
  );

  getIo().sendMsgToRoom(location.id, msg);
  getIo().updateGameStateForRoom(location.id);
}

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
    Array.from(location.creatures) as Targetable[]
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

  if (skipIfLocationIsEmpty && location.creatures.size <= 1) {
    return;
  }

  const ability = abilitySelector(instance);
  if (!ability) {
    return;
  }

  const targets = selectRandomTargets(instance, ability);
  activateAbility(ability.ability, instance, targets, ability.source);
}
