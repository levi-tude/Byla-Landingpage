import { useEffect } from 'react'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Experience from './components/Experience.jsx'
import Gallery from './components/Gallery.jsx'
import Testimonial from './components/Testimonial.jsx'
import Location from './components/Location.jsx'
import CTA from './components/CTA.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    const elements = document.querySelectorAll('[data-reveal]')

    if (prefersReducedMotion) {
      elements.forEach((element) => element.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-sand-50 text-slate-900">
      <Hero />
      <main>
        <About />
        <Experience />
        <Gallery />
        <Testimonial />
        <Location />
      </main>
      <CTA />
      <Footer />
    </div>
  )
}
