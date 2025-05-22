import { ObjectId } from "bson";
import Session from "./types/Session";

class SessionManager {
  private sessions: Map<ObjectId, Session>;

  constructor() {
    this.sessions = new Map<ObjectId, Session>();
  }

  public createSession(accountId: ObjectId): Session {
    const session: Session = {
      _id: new ObjectId(),
      accountId,
      playerProgressId: undefined,
      playerInstanceId: undefined,
    };

    this.sessions.set(session._id, session);
    return session;
  }

  public getSession(sessionId: ObjectId): Session | undefined {
    return this.sessions.get(sessionId);
  }

  public deleteSession(sessionId: ObjectId): boolean {
    return this.sessions.delete(sessionId);
  }
}

if (!(globalThis as any).sessionManager) {
  (globalThis as any).sessionManager = new SessionManager();
}

export default (globalThis as any).sessionManager;
