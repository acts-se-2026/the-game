import { useNavigate } from "react-router";
import { useUser } from "../../../context/UserContext";

const LogoutButton = () => {
    const navigate = useNavigate();
    const { logout } = useUser();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl cursor-pointer bg-gray-500/30 px-4 py-2.5 font-medium text-white/80 transition hover:bg-gray-400/40"
        >
            Logout
        </button>
    );
};

export default LogoutButton;
