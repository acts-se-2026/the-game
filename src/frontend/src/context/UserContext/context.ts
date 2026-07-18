import { createContext } from "react";
import type { UserSession } from "./types";

export type UserContextType = {
    user: UserSession | null;
    isLoading: boolean;
    login: (username: string) => Promise<void>;
    logout: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);
