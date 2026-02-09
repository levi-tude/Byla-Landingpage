const aboutImage =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80'

export default function About() {
  return (
    <section id="sobre" className="section-padding bg-sand-50">
      <div className="container-layout grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6" data-reveal>
          <p className="section-subtitle">Sobre o Byla</p>
          <h2 className="section-title">
            Um espaço de experiência onde cada detalhe é pensado para encantar.
          </h2>
          <p className="text-base text-slate-600">
            O Byla nasce para quem busca sofisticação com alma litorânea. Entre
            linhas contemporâneas, texturas naturais e o ritmo leve de Stella
            Maris, o espaço convida a viver momentos com presença, estética e
            significado.
          </p>
          <p className="text-base text-slate-600">
            Seja para encontros, eventos curados ou pausas de bem-estar, o Byla
            oferece um cenário exclusivo que traduz lifestyle, conforto e a
            beleza da praia em Salvador.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Curadoria sensorial', 'Arquitetura aberta', 'Serviço premium'].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-sand-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-500"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
        <div className="relative" data-reveal>
          <div className="absolute -left-8 -top-8 hidden h-24 w-24 rounded-full border border-sand-200 bg-white/70 lg:block"></div>
          <div className="overflow-hidden rounded-3xl shadow-soft">
            <img
              src={aboutImage}
              alt="Vegetação tropical ao pôr do sol em Stella Maris"
              className="h-[420px] w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
