const socials = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'WhatsApp', href: 'https://wa.me' },
  { label: 'Contato', href: 'mailto:contato@byla.com.br' },
]

export default function Footer() {
  return (
    <footer className="border-t border-sand-100 bg-sand-50 py-10">
      <div className="container-layout flex flex-col gap-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            Byla — Stella Maris
          </p>
          <p>Espaço premium para experiências exclusivas em Salvador/BA.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {socials.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-xs uppercase tracking-[0.3em] text-slate-500 transition hover:text-ocean-700"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
