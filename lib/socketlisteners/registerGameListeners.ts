import { activateAbility, moveCreature } from "lib/creatureutils";
import locations from "lib/locations";
import { getAbilitySourceName } from "lib/types/Ability";
import { LocationId } from "lib/types/Location";
import {
  getPlayer,
  TypedSocket,
  updateGameState,
} from "lib/types/socketioserverutils";
import { Targetable } from "lib/types/types";

export default function registerGameListeners(socket: TypedSocket) {
  socket.on("requestGameState", () => {
    updateGameState(socket);
  });

  socket.on("move", (exitId: LocationId) => {
    const player = getPlayer(socket);

    moveCreature(player.instance, exitId);
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

          for (const creature of Array.from(location.creatures)) {
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

      activateAbility(ability.ability, player.instance, targets, source);
    }
  );
}
