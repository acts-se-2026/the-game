import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { backendApi } from "../../api/backend";
import type { UserSession } from "./types";

type UserContextType = {
    user: UserSession | null;
    isLoading: boolean;
    login: (username: string) => Promise<void>;
    logout: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserSession | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAuthStatus = async () => {
        try {
            const response = await backendApi.get<UserSession>("/api/auth/me");
            setUser(response.data);
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = async (username: string) => {
        setIsLoading(true);
        try {
            await backendApi.post("/api/auth/login", { username });
            await checkAuthStatus();
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await backendApi.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout request failed:", error);
        } finally {
            setUser(null);
            setIsLoading(false);
        }
    };

    return (
        <UserContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
