const experiences = [
  {
    title: 'Eventos & Celebrações',
    description:
      'Cenário ideal para encontros intimistas, celebrações ao pôr do sol e experiências exclusivas.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <path
          d="M4 15c3-1 5-1 8 1s5 2 8 1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 9c2.5 1.2 4.8 1.6 7 1.6S15.5 10.2 21 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 4v5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Bem-estar & Ritual',
    description:
      'Práticas de movimento, pausas contemplativas e rituais que harmonizam corpo e mente.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <path
          d="M12 3c2.5 2.5 2.5 6.5 0 9s-2.5 6.5 0 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 6c1.8 1.8 1.8 4.8 0 6.6s-1.8 4.8 0 6.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M17 6c-1.8 1.8-1.8 4.8 0 6.6s1.8 4.8 0 6.6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Gastronomia & Cultura',
    description:
      'Experiências sensoriais com sabores locais, chefs convidados e estética impecável.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <path
          d="M7 3v6a3 3 0 0 0 6 0V3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M17 3v18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M4 21h16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: 'Lifestyle & Marcas',
    description:
      'Lançamentos, shootings e encontros que celebram design, moda e cultura praiana.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
        <path
          d="M4 12h16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 4v16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M6.5 6.5l11 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

export default function Experience() {
  return (
    <section id="experiencia" className="section-padding bg-white">
      <div className="container-layout space-y-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4" data-reveal>
            <p className="section-subtitle">A experiência</p>
            <h2 className="section-title">
              Vivências pensadas para um lifestyle sofisticado e leve.
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate-500" data-reveal>
            Do nascer ao pôr do sol, cada atmosfera do Byla é desenhada para
            despertar os sentidos e criar memórias de alto padrão.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2" data-reveal>
          {experiences.map((item) => (
            <div
              key={item.title}
              className="group flex flex-col gap-4 rounded-3xl border border-sand-100 bg-sand-50/60 p-8 transition hover:-translate-y-1 hover:border-sand-200 hover:bg-white hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-ocean-700 shadow-sm transition group-hover:bg-ocean-700 group-hover:text-white">
                {item.icon}
              </div>
              <h3 className="text-xl font-medium text-slate-900">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
