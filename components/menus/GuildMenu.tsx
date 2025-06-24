import { PlayerInstance } from "lib/types/entities/player";
import Guild from "lib/types/Guild";

export default function GuildMenu({
  self,
  guild,
}: {
  self: PlayerInstance;
  guild: Guild;
}) {
  return (
    <div className="border w-1/5 flex flex-col gap-2">
      <h1 className="text-xl">Guild: {guild.name}</h1>
    </div>
  );
}
