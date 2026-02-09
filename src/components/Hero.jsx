import Navbar from './Navbar.jsx'

const heroImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80'

const highlights = [
  'Arquitetura contemporânea integrada à natureza',
  'Experiências exclusivas com curadoria sensorial',
  'Ambiente reservado para encontros e celebrações',
]

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <Navbar />
      <div className="absolute inset-0 bg-gradient-to-b from-ocean-800/70 via-ocean-800/30 to-sand-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent_55%)]"></div>

      <div className="relative z-10 flex min-h-screen items-center">
        <div className="container-layout grid gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 text-white" data-reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-white/80">
              Espaço Byla
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Onde a sofisticação encontra o mar de Stella Maris.
            </h1>
            <p className="max-w-xl text-base text-white/85 sm:text-lg">
              Um refúgio contemporâneo em Salvador/BA para encontros memoráveis,
              bem-estar e experiências que celebram o lifestyle litorâneo com
              elegância.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#contato"
                className="rounded-full bg-white px-6 py-3 text-xs font-medium uppercase tracking-[0.3em] text-ocean-800 transition hover:-translate-y-0.5 hover:shadow-glow"
              >
                Viva a experiência Byla
              </a>
              <a
                href="#sobre"
                className="text-xs uppercase tracking-[0.3em] text-white/80 transition hover:text-white"
              >
                Conheça o espaço
              </a>
            </div>
          </div>
          <div className="flex items-end" data-reveal>
            <div className="glass-panel w-full rounded-3xl p-8 text-slate-800 shadow-soft">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                Essência Byla
              </p>
              <h2 className="mt-4 text-2xl font-medium text-slate-900">
                Design, exclusividade e natureza em perfeita harmonia.
              </h2>
              <ul className="mt-6 space-y-4 text-sm text-slate-600">
                {highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-ocean-700"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Localização
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    Stella Maris — Salvador/BA
                  </p>
                </div>
                <div className="rounded-2xl border border-sand-200 bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Atmosfera
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    Praia, bem-estar e experiências privadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
