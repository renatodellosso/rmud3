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
import { getIo } from "lib/ClientFriendlyIo";
import { restoreFieldsAndMethods, savePlayer } from "lib/utils";
import { EJSON, ObjectId } from "bson";
import { ItemInstance } from "lib/types/item";
import { ContainerInstance } from "lib/types/entities/container";
import { DirectInventory } from "lib/types/Inventory";
import getPlayerManager from "lib/PlayerManager";
import Guild from "lib/types/Guild";

export default function registerGameListeners(socket: TypedSocket) {
  socket.on("requestGameState", () => {
    updateGameState(socket);
  });

  socket.on("move", (exitId: LocationId) => {
    const player = getPlayer(socket);

    if (player.instance.health <= 0) return;

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

      if (
        new Date() < player.instance.canActAt ||
        player.instance.health <= 0
      ) {
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

  socket.on("startInteraction", async (entityId: string) => {
    if (
      socket.data.session?.interactions.find(
        (i) => i.entityId.toString() === entityId
      )
    ) {
      throw new Error(`Interaction with entity ID ${entityId} already exists.`);
    }

    const player = getPlayer(socket);

    if (player.instance.health <= 0)
      return;

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

    const interaction = await def.interact(
      entity,
      player.instance,
      undefined,
      undefined
    );

    if (interaction) socket.data.session!.interactions.push(interaction);

    getIo().updateGameState(player.instance._id.toString());
  });

  socket.on("interact", async (entityId: string, action: any) => {
    const player = getPlayer(socket);
    
    if (player.instance.health <= 0) return;

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

    const newInteraction = await def.interact(
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

    if (player.instance.health <= 0) return;

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
      structuredClone(new ItemInstance(item.definitionId, 1, item.reforge)) // Ensure we equip one item
    );

    player.instance.inventory.remove(
      new ItemInstance(item.definitionId, 1, item.reforge)
    );

    getIo().updateGameState(player.instance._id.toString());
    savePlayer(player.instance);
  });

  socket.on("unequip", (item) => {
    const player = getPlayer(socket);
    
    if (player.instance.health <= 0) return;

    // Check if the item is equipped
    if (!player.instance.equipment.isEquipped(item)) {
      throw new Error(`Item ${item.definitionId} is not equipped.`);
    }

    if (!player.instance.equipment.unequip(item)) {
      throw new Error(`Failed to unequip item ${item.definitionId}.`);
    }

    player.instance.inventory.add(
      new ItemInstance(item.definitionId, 1, item.reforge),
      true
    );

    getIo().updateGameState(player.instance._id.toString());
    savePlayer(player.instance);
  });

  socket.on("dropItem", (itemEjson) => {
    const item = EJSON.parse(itemEjson) as ItemInstance;

    const player = getPlayer(socket);

    if (player.instance.health <= 0) return;

    const location = locations[player.instance.location];

    if (!player.instance.inventory.get(item)) {
      throw new Error(`Item ${item.definitionId} not found in inventory.`);
    }

    if (item.amount <= 0) {
      throw new Error(
        `Cannot drop item ${item.definitionId} with non-positive amount.`
      );
    }

    const foundItem = EJSON.parse(
      EJSON.stringify(player.instance.inventory.get(item))
    ) as ItemInstance;
    if (!foundItem) {
      throw new Error(`Item ${item.definitionId} not found in inventory.`);
    }

    restoreFieldsAndMethods(
      foundItem,
      new ItemInstance(foundItem.definitionId, foundItem.amount)
    );

    foundItem.amount = Math.min(foundItem.amount, item.amount);

    foundItem.amount = player.instance.inventory.remove(foundItem);

    if (foundItem.amount <= 0) {
      console.warn(
        `Cannot drop item ${foundItem.definitionId} with non-positive amount.`
      );
      return;
    }

    const inventory = new DirectInventory([foundItem]);
    const container = new ContainerInstance(
      location.id,
      `${foundItem.getName()} x${foundItem.amount}`,
      inventory,
      true
    );

    location.entities.add(container);

    getIo().sendMsgToRoom(
      location.id,
      `${player.instance.name} dropped ${foundItem.getName()} x${
        foundItem.amount
      }.`
    );
    getIo().updateGameStateForRoom(location.id);
  });

  socket.on("kickGuildMember", async (guildId: string, memberId: string) => {
    const playerManager = getPlayerManager();

    const kicker = getPlayer(socket);
    const kickee = await playerManager.getInstanceById(
      new ObjectId(memberId),
      true
    );

    if (!kickee) {
      throw new Error(`Player with ID ${memberId} not found.`);
    }

    const guild = await Guild.fromId(new ObjectId(guildId));

    if (!guild) {
      throw new Error(`Guild with ID ${guildId} not found.`);
    }

    if (!guild.members.some((id) => id.equals(kicker.instance._id))) {
      throw new Error(
        `Player ${kicker.instance.name} is not a member of the guild ${guild.name}.`
      );
    }

    if (!guild.owner || !kicker.instance._id.equals(guild.owner)) {
      throw new Error(
        `Player ${kicker.instance.name} is not the owner of the guild ${guild.name}.`
      );
    }

    kickee.guildId = undefined;
    guild.members = guild.members.filter(
      (member) => !member.equals(kickee._id)
    );

    Guild.upsert(guild);
    savePlayer(kickee);

    const io = getIo();

    io.sendMsgToRoom(
      kicker.instance.location,
      `${kicker.instance.name} has kicked ${kickee.name} from the guild ${guild.name}.`
    );
    io.updateGameStateForRoom(kicker.instance.location);

    io.sendMsgToPlayer(
      kickee._id.toString(),
      `You have been kicked from the guild ${guild.name} by ${kicker.instance.name}.`
    );
    io.updateGameState(kickee._id.toString());
  });
}
