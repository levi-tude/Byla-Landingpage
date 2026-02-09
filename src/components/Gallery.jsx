const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=1600&q=80',
    alt: 'Vista ampla do mar com tons azulados',
    className: 'md:col-span-7 md:row-span-2 h-[420px] lg:h-[520px]',
  },
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Texturas naturais e luz suave',
    className: 'md:col-span-5 h-[200px] lg:h-[240px]',
  },
  {
    src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
    alt: 'Vegetação tropical ao entardecer',
    className: 'md:col-span-5 h-[200px] lg:h-[240px]',
  },
  {
    src: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    alt: 'Interior minimalista com design contemporâneo',
    className: 'md:col-span-4 h-[240px]',
  },
  {
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Luz dourada sobre o oceano',
    className: 'md:col-span-4 h-[240px]',
  },
  {
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    alt: 'Paisagem costeira com recortes de areia',
    className: 'md:col-span-4 h-[240px]',
  },
]

export default function Gallery() {
  return (
    <section id="galeria" className="section-padding bg-sand-100">
      <div className="container-layout space-y-10">
        <div className="space-y-4" data-reveal>
          <p className="section-subtitle">Galeria</p>
          <h2 className="section-title">
            Estética clean e natural em cada detalhe.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-12" data-reveal>
          {galleryImages.map((image, index) => (
            <figure
              key={index}
              className={`group relative overflow-hidden rounded-3xl ${image.className}`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean-800/40 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100"></div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
