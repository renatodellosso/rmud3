import LocationMap from "lib/types/LocationMap";
import { LocationId } from "../../lib/gamedata/rawLocations";
import { useEffect, useRef, useState } from "react";

function DepthMap({
  map,
  depth,
  currentLocation,
}: {
  map: LocationMap;
  depth: number;
  currentLocation: LocationId;
}) {
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

    const cellPadding = width * 0.03;

    const cellWidth = width / floor[0].length - cellPadding;
    const cellHeight = cellWidth * (height / width);

    const corridorWidth = cellWidth * 0.25;

    function getCanvasCoords(x: number, y: number) {
      return [
        x * (cellWidth + cellPadding) + cellPadding / 2,
        y * (cellHeight + cellPadding) + cellPadding / 2,
      ];
    }

    // Draw exits
    ctx.lineWidth = corridorWidth;
    ctx.strokeStyle = "lightgray";
    for (let y = 0; y < floor.length; y++) {
      for (let x = 0; x < floor[y].length; x++) {
        const locId = floor[y][x];
        if (!locId) continue;

        const [xPos, yPos] = getCanvasCoords(x, y);

        // Draw exits
        const exits = map.getExitDirections(locId);

        const sameFloorExits = exits.filter((exit) => exit[0] === 0);

        sameFloorExits.forEach((exit) => {
          const [exitDepth, distY, distX] = exit;

          const [exitXPos, exitYPos] = getCanvasCoords(x + distX, y + distY);

          const startX = xPos + cellWidth / 2;
          const startY = yPos + cellHeight / 2;

          const exitX = exitXPos + cellWidth / 2;
          const exitY = exitYPos + cellHeight / 2;

          console.log(
            `Drawing exit from ${locId} at (${x}, ${y}) to (${exitX}, ${exitY})`
          );

          // Draw a line between the two points
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(exitX, exitY);
          ctx.stroke();
        });
      }
    }

    // Draw the grid
    for (let y = 0; y < floor.length; y++) {
      for (let x = 0; x < floor[y].length; x++) {
        const [xPos, yPos] = getCanvasCoords(x, y);
        const locId = floor[y][x];

        if (!locId) continue;

        ctx.fillStyle = locId === currentLocation ? "lightgreen" : map.visited[locId] ? "lightgray" : "lightblue";

        ctx.fillRect(xPos, yPos, cellWidth, cellHeight);
      }
    }
  }, [depth, map, currentLocation]);

  return <canvas ref={canvasRef} className="w-full h-96 border"></canvas>;
}

export default function MapMenu({
  map,
  currentLocation,
}: {
  map: LocationMap;
  currentLocation: LocationId;
}) {
  const [depth, setDepth] = useState(map.getDepth(currentLocation));

  useEffect(() => {
    setDepth(map.getDepth(currentLocation));
  }, [currentLocation]);

  return (
    <div className="border w-1/3">
      <h1 className="text-xl">Map</h1>
      <div className="flex gap-2 mb-2">
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
      <DepthMap map={map} depth={depth} currentLocation={currentLocation} />
    </div>
  );
}
