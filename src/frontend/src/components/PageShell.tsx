import type { ReactNode } from 'react'

type PageShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export default function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.22),_transparent_32rem)] bg-slate-950 px-4 py-10 text-slate-200 sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8 max-w-2xl">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-blue-400">{eyebrow}</p>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">{title}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">{description}</p>
        </header>
        {children}
      </div>
    </main>
  )
}