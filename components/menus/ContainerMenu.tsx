import { Interaction } from "lib/types/entity";
import { socket } from "lib/socket";
import items from 'lib/gamedata/items';

export default function ContainerMenu({
  interaction
}: {
  interaction: Interaction;
}) {
  function takeItem(index: number) {
    
  }

  return (
    <div className="border w-1/3 flex flex-col gap-2">
      <div className="flex justify-between">
        <h1 className="text-xl">{interaction.title}</h1>
        <button
          onClick={() => {
            // Close the crafting interaction
            socket.emit("interact", interaction.entityId.toString(), "exit");
          }}
          className="px-1"
        >
          Exit
        </button>
      </div>
      <table className="border-separate border-spacing-y-2">
        <thead>
          <tr>
            <th>Items</th>
          </tr>
        </thead>
        <tbody>
          {interaction.inventory!.map((item, index) => (
            <tr key={index} className="hover:bg-gray-900">
              <td>
                {items[item.definitionId].name} x{item.amount}
              </td>
              <td>
                <button onClick={() => takeItem(index)} className="px-1">
                  Take
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}