import { socket } from "lib/socket";
import { GameState } from "lib/types/types";
import { MapWithControls } from "./MapMenu";

export default function LocationMenu({ gameState }: { gameState: GameState }) {
  return (
    <div className="border w-1/6 flex flex-col justify-between">
      <div className="flex flex-col gap-2 overflow-y-scroll">
        <h1 className="text-xl">{gameState.location.name}</h1>
        <div>
          <h2 className="text-lg">Exits</h2>
          <ul className="flex flex-col gap-2">
            {gameState.location.exits.map((exit) => (
              <button
                key={exit.id}
                onClick={() => socket.emit("move", exit.id)}
              >
                {exit.name}
              </button>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-lg">Entities</h2>
          <ul>
            {gameState.location.entities.map((entity) => (
              <li key={entity._id.toString()}>
                {entity.name}{" "}
                {"health" in entity && "getMaxHealth" in entity && (
                  <>
                    ({(entity.health as number).toFixed()}/
                    {(entity.getMaxHealth as () => number)().toFixed()})
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <MapWithControls
        map={gameState.map}
        currentLocation={gameState.location.id}
      />
    </div>
  );
}
