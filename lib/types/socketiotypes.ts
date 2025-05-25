interface ServerToClientEvents {
  hello: () => void;
}

interface ClientToServerEvents {
  hello: () => void;
  signIn: (
    email: string,
    password: string,
    /**
     * If the sessionId is undefined, the sign in failed.
     */
    callback: (sessionId: string | undefined) => void
  ) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {}
