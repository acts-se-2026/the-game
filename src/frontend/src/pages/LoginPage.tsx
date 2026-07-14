import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import PageTitleTemplate from "../components/PageTitleTemplate";
import { useUser } from "../context/UserContext";

export default function LoginPage() {
    const navigate = useNavigate();
    const { setUsername: setGlobalUsername } = useUser();
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");

    const enterLobby = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const cleanUsername = username.trim();
        if (!cleanUsername) {
            setError("Enter a username to continue.");
            return;
        }

        setGlobalUsername(cleanUsername);
        navigate("/lobby/");
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen">
            <PageTitleTemplate
                eyebrow="Top-down shooter"
                title="Enter the arena"
                description="Choose a callsign, find a room, and be the last tank standing."
            />

            <form onSubmit={enterLobby} className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-black/20">
                <label htmlFor="username" className="block text-sm font-black text-white">
                    Username
                </label>
                <input
                    id="username"
                    value={username}
                    onChange={(event) => {
                        setUsername(event.target.value);
                        if (error) setError("");
                    }}
                    maxLength={24}
                    autoComplete="nickname"
                    placeholder="Your callsign"
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                />
                {error && (
                    <p role="alert" className="mt-2 text-sm font-bold text-rose-300">
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    className="mt-5 w-full rounded-xl bg-blue-500 px-5 py-3 font-black text-white transition hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    Enter lobby
                </button>
            </form>
        </div>
    );
}
