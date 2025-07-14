import { socket } from "lib/socket";
import { GameState } from "lib/types/types";
import { FormEvent, useState } from "react";

export default function ChatMenu({ gameState }: { gameState: GameState }) {
  const [message, setMessage] = useState("");

  const { chatMessages } = gameState;

  function sendMessage(e: FormEvent) {
    e.preventDefault();
    socket.emit("chat", message);
    setMessage("");
  }

  return (
    <div className="border w-1/6 h-full flex flex-col justify-between gap-2">
      <h2 className="text-lg">Chat</h2>
      <ul className="grow w-full flex flex-col-reverse h-full overflow-y-scroll">
        {chatMessages.toReversed().map((msg, index) => (
          <li key={index}>
            <strong>{msg.user}:</strong> {msg.message}
          </li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          name="message"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
