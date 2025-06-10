import { socket } from "lib/socket";
import { AbilityScore, GameState } from "lib/types/types";

export default function LocationMenu({ gameState }: { gameState: GameState }) {
  return (
    <div key="Location" className="border w-1/6 flex flex-col gap-2">
      <h1 className="text-xl">{gameState.location.name}</h1>
      <div>
        <h2 className="text-lg">Creatures</h2>
        <ul>
          {gameState.location.creatures.map((creature) => (
            <li key={creature._id.toString()}>
              {creature.name} ({creature.health}/{creature.getMaxHealth()})
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-lg">Exits</h2>
        <ul className="flex flex-col gap-2">
          {gameState.location.exits.map((exit) => (
            <button key={exit.id} onClick={() => socket.emit("move", exit.id)}>
              {exit.name}
            </button>
          ))}
        </ul>
      </div>
    </div>
  );
}
