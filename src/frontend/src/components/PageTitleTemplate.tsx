type Props = {
    eyebrow: string;
    title: string;
    description: string;
};

export default function PageTitleTemplate({ eyebrow, title, description }: Props) {
    return (
        <div className="mb-8">
            <header>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-blue-400">{eyebrow}</p>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">{title}</h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">{description}</p>
            </header>
        </div>
    );
}
