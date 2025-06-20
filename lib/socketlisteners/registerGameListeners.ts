import locations from "lib/locations";
import { getAbilitySourceName } from "lib/types/Ability";
import { LocationId } from "lib/gamedata/rawLocations";
import {
  getPlayer,
  TypedSocket,
  updateGameState,
} from "lib/types/socketioserverutils";
import { Targetable } from "lib/types/types";
import entities from "lib/gamedata/entities";
import getSessionManager from "lib/SessionManager";
import { getIo } from "lib/ClientFriendlyIo";
import { savePlayer } from "lib/utils";

export default function registerGameListeners(socket: TypedSocket) {
  socket.on("requestGameState", () => {
    updateGameState(socket);
  });

  socket.on("move", (exitId: LocationId) => {
    const player = getPlayer(socket);

    player.instance.move(exitId);

    const session = socket.data.session!;

    session.map.addLocation(exitId);
    session.map.visited[exitId] = true;

    updateGameState(socket);
  });

  socket.on(
    "activateAbility",
    (abilityName: string, sourceName: string, targetIds: string[]) => {
      const player = getPlayer(socket);

      if (new Date() < player.instance.canActAt) {
        return;
      }

      const abilities = player.instance.getAbilities();

      const ability = abilities.find(
        (a) =>
          a.ability.name === abilityName &&
          getAbilitySourceName(a.source) === sourceName
      );

      if (!ability) {
        console.error(
          `Ability ${abilityName} with source ${sourceName} not found for player ${player.instance.name}`
        );
        return;
      }

      // Find targets
      const location = locations[player.instance.location];
      const targets = targetIds
        .map((id) => {
          if (id === location.id) {
            return location;
          }

          for (const creature of Array.from(location.entities)) {
            if (creature._id.equals(id)) {
              return creature;
            }
          }
        })
        .filter((t) => t != undefined) as Targetable[];

      // Find source
      const source = abilities.find(
        (a) => getAbilitySourceName(a.source) === sourceName
      )?.source;

      if (!source) {
        console.error(
          `Source ${sourceName} not found for ability ${abilityName} for player ${player.instance.name}`
        );
        return;
      }
      player.instance.activateAbility(ability.ability, targets, source);
    }
  );

  socket.on("startInteraction", (entityId: string) => {
    if (
      socket.data.session?.interactions.find(
        (i) => i.entityId.toString() === entityId
      )
    ) {
      throw new Error(`Interaction with entity ID ${entityId} already exists.`);
    }

    const player = getPlayer(socket);
    const entity = Array.from(
      locations[player.instance.location].entities
    ).find((e) => e._id.toString() === entityId);

    if (!entity) {
      throw new Error(
        `Entity with ID ${entityId} not found in location ${player.instance.location}.`
      );
    }

    const def = entities[entity.definitionId];

    if (!def.interact) {
      throw new Error(
        `Entity with ID ${entityId} does not have an interact method defined.`
      );
    }

    const interaction = def.interact(
      entity,
      player.instance,
      undefined,
      undefined
    );

    if (interaction) socket.data.session!.interactions.push(interaction);

    getIo().updateGameState(player.instance._id.toString());
  });

  socket.on("interact", (entityId: string, action: any) => {
    const player = getPlayer(socket);
    const entity = Array.from(
      locations[player.instance.location].entities
    ).find((e) => e._id.toString() === entityId);

    const interaction = socket.data.session?.interactions.find(
      (i) => i.entityId.toString() === entityId
    );

    if (!entity) {
      throw new Error(`Entity with ID ${entityId} not found in location.`);
    }

    if (!interaction) {
      throw new Error(`No interaction found for entity with ID ${entityId}.`);
    }

    const def = entities[entity.definitionId];
    if (!def.interact) {
      throw new Error(
        `Entity with ID ${entityId} does not have an interact method defined.`
      );
    }

    const newInteraction = def.interact(
      entity,
      player.instance,
      interaction,
      action
    );

    if (newInteraction) {
      const index = socket.data.session!.interactions.findIndex(
        (i) => i.entityId.toString() === entityId
      );

      socket.data.session!.interactions[index!] = newInteraction;
    } else
      socket.data.session!.interactions =
        socket.data.session!.interactions.filter(
          (i) => i.entityId.toString() !== entityId
        );

    getIo().updateGameState(player.instance._id.toString());
  });

  socket.on("equip", (item) => {
    const player = getPlayer(socket);

    if (
      player.instance.equipment.items.length >=
      player.instance.equipment.getCapacity(player.instance)
    ) {
      throw new Error(
        `Cannot equip item ${item.definitionId}: Equipment is full.`
      );
    }

    if (!player.instance.equipment.canEquip(player.instance, item)) {
      throw new Error(
        `Item ${item.definitionId} cannot be equipped by player ${player.instance.name}.`
      );
    }

    // Check if the item is in the player's inventory
    if (!player.instance.inventory.get(item)) {
      throw new Error(
        `Item ${item.definitionId} not found in player's inventory.`
      );
    }

    player.instance.equipment.equip(
      player.instance,
      structuredClone({
        ...item,
        amount: 1, // Ensure we equip one item
      })
    );

    player.instance.inventory.remove({
      ...item,
      amount: 1,
    });

    getIo().updateGameState(player.instance._id.toString());
    savePlayer(player.instance);
  });

  socket.on("unequip", (item) => {
    const player = getPlayer(socket);

    // Check if the item is equipped
    if (!player.instance.equipment.isEquipped(item)) {
      throw new Error(`Item ${item.definitionId} is not equipped.`);
    }

    if (!player.instance.equipment.unequip(item)) {
      throw new Error(`Failed to unequip item ${item.definitionId}.`);
    }

    player.instance.inventory.add(
      {
        ...item,
        amount: 1,
      },
      true
    );

    getIo().updateGameState(player.instance._id.toString());
    savePlayer(player.instance);
  });
}
