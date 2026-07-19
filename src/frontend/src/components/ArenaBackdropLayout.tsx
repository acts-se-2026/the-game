import { type ReactNode, useState } from "react";
import { getRandomBackgroundPhoto } from "./backgroundPhotos";

type ArenaBackdropLayoutProps = {
    children: ReactNode;
    centerContent?: boolean;
};

export default function ArenaBackdropLayout({ children, centerContent = false }: ArenaBackdropLayoutProps) {
    const [backgroundPhoto] = useState(getRandomBackgroundPhoto);

    return (
        <main className="relative min-h-screen overflow-hidden bg-slate-950">
            <div className="fixed inset-0">
                {backgroundPhoto && (
                    <img
                        src={backgroundPhoto}
                        alt="Arena background"
                        className="h-full w-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-slate-950/35" />
            </div>

            <section className={`relative z-10 mx-auto my-4 min-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-5xl rounded-[2rem] border border-slate-700/80 bg-slate-950/92 px-6 py-10 shadow-2xl shadow-black/60 backdrop-blur-sm sm:my-8 sm:min-h-[calc(100vh-4rem)] sm:w-[calc(100%-4rem)] sm:px-10 sm:py-12${centerContent ? " flex items-center" : ""}`}>
                <div className="mx-auto w-full max-w-4xl">
                    {children}
                </div>
            </section>
        </main>
    );
}