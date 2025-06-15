"use client";

import { Dungeon } from "lib/dungeongeneration/types";
import { useEffect, useRef, useState } from "react";
import generateDungeonLayout from "lib/dungeongeneration/generateDungeonLayout";
import { getCoordsFromId as getCoordsFromLocationId } from "lib/dungeongeneration/utils";
import generateDungeon from "lib/dungeongeneration/generateDungeon";

export default function DungeonVis() {
  const [dungeon, setDungeon] = useState<Dungeon>();
  const [selectedDepth, setSelectedFloor] = useState<number>();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const dungeon = generateDungeon();
    console.log("Generated Dungeon:", dungeon);
    setDungeon(dungeon);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || selectedDepth === undefined) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const floor = dungeon?.locations[selectedDepth];
    if (!floor) return; // No floor selected

    const roomWidth = canvasRef.current.width / floor[0].length;
    const roomHeight = canvasRef.current.height / floor.length;

    floor.forEach((row, rowIndex) => {
      row.forEach((room, colIndex) => {
        ctx.fillStyle = room
          ? room.floor.definition.visualizerColor
          : "lightgray"; // Default to light gray for empty rooms

        const x = colIndex * roomWidth + 5; // Add padding
        const y = rowIndex * roomHeight + 5; // Add padding

        ctx.fillRect(x, y, roomWidth - 10, roomHeight - 10); // Subtract padding

        ctx.strokeStyle = "black";
        ctx.strokeRect(x, y, roomWidth - 10, roomHeight - 10);

        if (!room) return; // Skip if room is undefined

        ctx.fillStyle = "black";
        ctx.fillText(
          `(${room.entities.size}) ${room.name}`,
          x,
          y + roomHeight / 2
        );

        // Draw connections
        for (const exit of Array.from(room.exits)) {
          const exitCoords = getCoordsFromLocationId(exit);
          const depthDiff = exitCoords.depth - selectedDepth;
          if (depthDiff < 0) {
            // Draw up arrow if exit if exit is below the current depth
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.moveTo(x + roomWidth / 2, y + roomHeight / 2);
            ctx.lineTo(
              x + roomWidth / 2 - 5,
              y + roomHeight / 2 + 10 * Math.abs(depthDiff)
            );
            ctx.lineTo(
              x + roomWidth / 2 + 5,
              y + roomHeight / 2 + 10 * Math.abs(depthDiff)
            );
            ctx.closePath();
            ctx.fill();

            continue;
          }

          if (depthDiff > 0) {
            // Draw down arrow if exit is above the current depth
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.moveTo(x + roomWidth / 2, y + roomHeight / 2);
            ctx.lineTo(
              x + roomWidth / 2 - 5,
              y + roomHeight / 2 - 10 * Math.abs(depthDiff)
            );
            ctx.lineTo(
              x + roomWidth / 2 + 5,
              y + roomHeight / 2 - 10 * Math.abs(depthDiff)
            );
            ctx.closePath();
            ctx.fill();

            continue;
          }

          try {
            // Draw line to the exit room
            const exitRoom = floor[exitCoords.coords[0]][exitCoords.coords[1]];
            if (exitRoom) {
              const exitX =
                exitCoords.coords[1] * roomWidth + 5 + roomWidth / 2; // Center the exit
              const exitY =
                exitCoords.coords[0] * roomHeight + 5 + roomHeight / 2; // Center the exit

              ctx.strokeStyle = "blue";

              ctx.beginPath();
              ctx.moveTo(x + roomWidth / 2, y + roomHeight / 2);
              ctx.lineTo(exitX, exitY);
              ctx.stroke();
            }
          } catch (error) {
            console.error("Error drawing exit connection:", error);
            ctx.fillStyle = "red";
            ctx.fillText("Error", x + roomWidth / 2 - 10, y + roomHeight / 2);
          }
        }
      });
    });
  }, [selectedDepth, dungeon]);

  if (!dungeon) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-xl">Dungeon Visualization</h1>
      <button onClick={() => setDungeon(generateDungeonLayout())}>
        Regenerate Dungeon
      </button>
      <div>
        <h2 className="text-lg">Floors</h2>
        <ul>
          {dungeon.floors.map((floor, index) => (
            <li key={index}>
              <div className="flex gap-2">
                <h3>
                  Floor {index + 1}: {floor.definition.name}
                </h3>
                <button onClick={() => setSelectedFloor(floor.depth)}>
                  View
                </button>
              </div>
              <div>
                Rooms:{" "}
                {
                  floor.locations.flat().filter((room) => room !== undefined)
                    .length
                }
              </div>
              <div>Depth: {floor.depth}</div>
            </li>
          ))}
        </ul>
      </div>
      {selectedDepth !== undefined && (
        <>
          <div className="text-lg mt-2">Viewing Depth {selectedDepth}</div>
          <canvas ref={canvasRef} width={500} height={500} />
        </>
      )}
    </div>
  );
}
