const links = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Experiência', href: '#experiencia' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Localização', href: '#localizacao' },
]

export default function Navbar() {
  return (
    <header className="absolute left-0 top-0 z-20 w-full">
      <div className="container-layout">
        <div className="flex items-center justify-between rounded-full border border-white/40 bg-white/40 px-5 py-4 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="text-sm uppercase tracking-[0.35em] text-slate-600">
              Byla
            </span>
            <span className="hidden text-xs text-slate-500 sm:inline">
              Stella Maris — Salvador/BA
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.25em] text-slate-600 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-ocean-700"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a
            href="#contato"
            className="rounded-full border border-ocean-700 px-4 py-2 text-xs uppercase tracking-[0.3em] text-ocean-700 transition hover:bg-ocean-700 hover:text-white"
          >
            Viva o Byla
          </a>
        </div>
      </div>
    </header>
  )
}
