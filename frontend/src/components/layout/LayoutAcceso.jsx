import BotonTema from '../BotonTema.jsx'
import PanelIdentidad from '../PanelIdentidad.jsx'
import PieLegal from '../PieLegal.jsx'

/** Estructura de pantallas públicas (recuperar contraseña): identidad a la izquierda, formulario a la derecha. */
export default function LayoutAcceso({ children }) {
  return (
    <div className="min-h-[calc(100dvh-2rem)] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="hidden lg:sticky lg:top-8 lg:block lg:h-[calc(100dvh-2rem)]"><PanelIdentidad /></div>
      <div className="lg:hidden"><PanelIdentidad compacto /></div>
      <div className="relative flex flex-col px-5 pt-6 pb-24 sm:px-10 lg:min-h-[calc(100dvh-2rem)] lg:justify-center lg:py-12">
        <BotonTema className="absolute top-4 right-4 sm:top-6 sm:right-6" />
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          {children}
          <PieLegal className="mt-4" />
        </div>
      </div>
    </div>
  )
}
