import { ObjectId } from "bson";
import { socket } from "lib/socket";
import { PlayerInstance } from "lib/types/entities/player";
import Guild, { ClientGuild, GuildMember } from "lib/types/Guild";

function MemberEntry({
  member,
  isSelfOwner,
  selfId,
  guildId,
}: {
  member: GuildMember;
  isSelfOwner: boolean;
  selfId: ObjectId;
  guildId: ObjectId;
}) {
  function kick() {
    if (
      !confirm(
        `Are you sure you want to kick ${member.name} out of your guild?`
      )
    )
      return;

    socket.emit("kickGuildMember", guildId.toString(), member._id.toString());
  }

  return (
    <li className="flex justify-between">
      <div>
        {member.name} - lvl {member.level}
        {member.isOwner && " (Owner)"}
        {member.isOnline && " (Online)"}
      </div>
      {isSelfOwner && !selfId.equals(member._id) && (
        <button onClick={kick} className="text-red-500 hover:text-red-700">
          Kick
        </button>
      )}
    </li>
  );
}

export default function GuildMenu({
  self,
  guild,
}: {
  self: PlayerInstance;
  guild: ClientGuild;
}) {
  return (
    <div className="border w-1/5 flex flex-col gap-2">
      <h1 className="text-xl">Guild: {guild.name}</h1>
      <div>
        <strong>Members</strong>
        <ul>
          {guild.memberInstances.map((member) => (
            <MemberEntry
              key={member._id.toString()}
              member={member}
              isSelfOwner={self._id.equals(guild.owner)}
              selfId={self._id}
              guildId={guild._id}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
