const locationImage =
  'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1800&q=80'

export default function Location() {
  return (
    <section id="localizacao" className="section-padding bg-white">
      <div className="container-layout grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6" data-reveal>
          <p className="section-subtitle">Localização</p>
          <h2 className="section-title">
            Stella Maris: mar aberto, natureza preservada e exclusividade.
          </h2>
          <p className="text-base text-slate-600">
            Um dos endereços mais desejados de Salvador, Stella Maris oferece o
            equilíbrio perfeito entre praia, tranquilidade e sofisticação. O
            Byla está cercado por paisagens naturais e uma atmosfera que inspira
            contemplação.
          </p>
          <div className="rounded-3xl border border-sand-100 bg-sand-50/70 p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Destino
            </p>
            <p className="mt-3 text-lg font-medium text-slate-900">
              Stella Maris — Salvador/BA
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Entre o azul do oceano e a brisa tropical que define o lifestyle
              baiano.
            </p>
          </div>
        </div>
        <div className="relative" data-reveal>
          <div className="absolute -right-6 -top-6 hidden h-20 w-20 rounded-full border border-sand-200 bg-white/80 lg:block"></div>
          <div className="overflow-hidden rounded-3xl shadow-soft">
            <img
              src={locationImage}
              alt="Panorama do litoral de Stella Maris"
              className="h-[420px] w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute bottom-6 left-6 rounded-2xl bg-white/90 px-4 py-3 text-xs uppercase tracking-[0.3em] text-ocean-700 shadow-soft">
            Stella Maris
          </div>
        </div>
      </div>
    </section>
  )
}
