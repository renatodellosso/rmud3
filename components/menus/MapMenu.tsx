import LocationMap from "lib/types/LocationMap";
import { LocationId } from "../../lib/gamedata/rawLocations";
import { useEffect, useRef, useState } from "react";

const CELL_PADDING = 15;
const CORRIDOR_WIDTH = 5;

function DepthMap({ map, depth }: { map: LocationMap; depth: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const floor = map.locations[depth];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const cellWidth = width / floor[0].length - CELL_PADDING;
    const cellHeight = height / floor.length - CELL_PADDING;

    function getCanvasCoords(x: number, y: number) {
      return [
        x * (cellWidth + CELL_PADDING) + CELL_PADDING / 2,
        y * (cellHeight + CELL_PADDING) + CELL_PADDING / 2,
      ];
    }

    for (let y = 0; y < floor.length; y++) {
      for (let x = 0; x < floor[y].length; x++) {
        const locId = floor[y][x];
        if (!locId) continue;

        const [xPos, yPos] = getCanvasCoords(x, y);

        ctx.fillStyle = "lightgray";

        ctx.fillRect(xPos, yPos, cellWidth, cellHeight);

        // Draw exits
        const exits = map.getExitDirections(locId);

        const sameFloorExits = exits.filter((exit) => exit[0] === depth);

        sameFloorExits.forEach((exit) => {
          const [exitDepth, distY, distX] = exit;

          const [exitXPos, exitYPos] = getCanvasCoords(x + distX, y + distY);

          const startX = xPos + cellWidth / 2;
          const startY = yPos + cellHeight / 2;

          const exitX = exitXPos + cellWidth / 2;
          const exitY = exitYPos + cellHeight / 2;

          // Draw a line between the two points
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(exitX, exitY);
          ctx.lineWidth = CORRIDOR_WIDTH;
          ctx.strokeStyle = "lightgray";
          ctx.stroke();
        });
      }
    }
  }, [depth, map]);

  return <canvas ref={canvasRef} className="w-full h-96"></canvas>;
}

export default function MapMenu({
  map,
  currentLocation,
}: {
  map: LocationMap;
  currentLocation: LocationId;
}) {
  const [depth, setDepth] = useState(map.getDepth(currentLocation));

  return (
    <div className="border w-1/3">
      <h1 className="text-xl">Map</h1>
      <div className="flex gap-2">
        <h2 className="text-lg">Viewing depth {depth}</h2>
        <button
          onClick={() => setDepth(Math.max(depth - 1, 0))}
          disabled={depth == 0}
          className="w-4"
        >
          -
        </button>
        <button
          onClick={() =>
            setDepth(Math.min(depth + 1, map.locations.length - 1))
          }
          disabled={depth == map.locations.length - 1}
          className="w-4"
        >
          +
        </button>
      </div>
      <DepthMap map={map} depth={depth} />
    </div>
  );
}
