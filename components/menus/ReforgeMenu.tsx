import { socket } from "lib/socket";
import { PlayerInstance } from "lib/types/entities/player";
import { Interaction } from "lib/types/entity";
import items from 'lib/gamedata/items';
import { getFromOptionalFunc } from "lib/utils";

export default function ReforgeMenu({
  interaction, 
  self
}: {
  interaction: Interaction;
  self: PlayerInstance;
}) {
  return (
    <div className="border w-1/3 flex flex-col gap-2">
      <div className="flex justify-between">
        <h1 className="text-xl">{interaction.title}</h1>
        <button
          onClick={() => {
            // Close the container interaction
            socket.emit("interact", interaction.entityId.toString(), "exit");
          }}
          className="px-1"
        >
          Exit
        </button>
      </div>
      <div>
        <div className="text-center">Equipment</div>
        <table className="w-full border-separate border-spacing-y-2">
          <tbody>
            {self.equipment.items.map((item, index) => (
              <tr key={index}>
                <td>
                  {getFromOptionalFunc(items[item.definitionId].getName, item)}
                </td>
                <td>
                  <button
                    onClick={() => {
                      socket.emit(
                        "interact",
                        interaction.entityId.toString(),
                        index
                      );
                    }}
                    className="px-1"
                  >
                    Reforge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
