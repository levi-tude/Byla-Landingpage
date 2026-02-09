export default function CTA() {
  return (
    <section id="contato" className="bg-ocean-800 py-20">
      <div className="container-layout">
        <div className="grid gap-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-white md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-4" data-reveal>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70">
              Seu próximo encontro começa aqui
            </p>
            <h2 className="text-3xl font-medium leading-tight sm:text-4xl">
              Viva o lifestyle Byla com sofisticação e presença.
            </h2>
            <p className="text-sm text-white/75">
              Agende uma visita, solicite uma proposta ou descubra como criar
              momentos exclusivos à beira-mar.
            </p>
          </div>
          <div className="flex flex-col gap-4" data-reveal>
            <a
              href="mailto:contato@byla.com.br"
              className="rounded-full bg-white px-6 py-3 text-center text-xs font-medium uppercase tracking-[0.3em] text-ocean-800 transition hover:-translate-y-0.5 hover:shadow-glow"
            >
              Fale com o Byla
            </a>
            <a
              href="https://instagram.com"
              className="rounded-full border border-white/50 px-6 py-3 text-center text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-ocean-800"
            >
              Instagram Byla
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
