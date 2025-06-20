import { ObjectId } from "bson";
import Session from "./types/Session";
import { getSingleton } from "./utils";
import LocationMap from "./types/LocationMap";

export class SessionManager {
  private sessions: Map<string, Session>;

  constructor() {
    this.sessions = new Map<string, Session>();
  }

  public createSession(accountId: ObjectId): Session {
    const session: Session = {
      _id: new ObjectId(),
      accountId,
      playerProgressId: undefined,
      playerInstanceId: undefined,
      messages: [],
      interactions: [],
      map: new LocationMap()
    };

    this.sessions.set(session._id.toString(), session);
    return session;
  }

  public getSession(sessionId: ObjectId | undefined): Session | undefined {
    if (!sessionId) return undefined;
    return this.sessions.get(sessionId.toString());
  }

  public deleteSession(sessionId: ObjectId): boolean {
    return this.sessions.delete(sessionId.toString());
  }
}

const getSessionManager = () =>
  getSingleton<SessionManager>("sessionManager", () => new SessionManager())!;

export default getSessionManager;
