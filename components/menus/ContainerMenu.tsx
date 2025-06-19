import { Interaction } from "lib/types/entity";
import { socket } from "lib/socket";

export default function ContainerMenu({
  interaction
}: {
  interaction: Interaction;
}) {


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
          
        </tbody>
      </table>
    </div>
  );
}