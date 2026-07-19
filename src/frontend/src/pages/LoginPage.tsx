import { Navigate } from "react-router";
import ArenaBackdropLayout from "../components/ArenaBackdropLayout";
import { useUser } from "../context/UserContext/useUser";

export default function LoginPage() {
    const { user } = useUser();

    if (user) {
        return <Navigate to="/lobby" replace />;
    }

    return <ArenaBackdropLayout sceneryOnly />;
}
