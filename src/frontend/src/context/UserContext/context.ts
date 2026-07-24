import { createContext } from "react";
import type { UserSession } from "./types";

/** Public API of the user/session context. */
export type UserContextType = {
    /** Current authenticated user session, or `null` if not logged in. */
    user: UserSession | null;
    /** `true` while initial auth check or login/logout is in progress. */
    isLoading: boolean;
    /** Start a session by posting the username to the backend; updates `user`. */
    login: (username: string) => Promise<void>;
    /** End the session and clear `user`. */
    logout: () => Promise<void>;
};

/** React Context carrying the current user session and auth helpers. */
export const UserContext = createContext<UserContextType | undefined>(undefined);
