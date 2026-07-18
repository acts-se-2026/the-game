import { useState, useEffect, type ReactNode } from "react";
import { backendApi } from "../../api/backend";
import type { UserSession } from "./types";
import { UserContext } from "./context";

export function UserContextProvider({ children }: { children: ReactNode }) {
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
        const initAuth = async () => {
            await checkAuthStatus();
        };
        initAuth();
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
