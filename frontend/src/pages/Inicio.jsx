import { useAuth } from '../context/AuthContext.jsx'
import { useApi } from '../hooks/useApi.js'
import { AlertaCompacta, AlertaDestacada } from '../components/TarjetaAlerta.jsx'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import Icono from '../components/Icono.jsx'

export default function Inicio() {
  const { usuario } = useAuth()
  // Se vuelve a consultar cada 60 s: si se publica una alerta, aparece sin recargar la página
  const todas = useApi('/alerts/active?todas=1', { intervalo: 60000 })

  if (todas.cargando) return <Cargando texto="Buscando alertas…" />
  if (todas.error) return <Aviso tipo="error">{todas.error}</Aviso>

  const alertas = todas.datos.alertas
  const deMiRegion = alertas.filter((a) => a.region === usuario.region)
  const otras = alertas.filter((a) => a.region !== usuario.region)
  const [principal, ...restoRegion] = deMiRegion

  return (
    <div className="flex flex-col gap-4">
      {principal ? (
        <AlertaDestacada alerta={principal} />
      ) : (
        <section className="flex flex-col gap-2 rounded-[20px] border-2 border-riesgo-bajo bg-riesgo-bajo-fondo p-4.5">
          <p className="flex items-center gap-2 text-nota font-bold tracking-wide text-ok-texto">
            <Icono nombre="palomita" tam={20} grosor={2.6} /> SIN ALERTAS
          </p>
          <h1 className="text-pantalla leading-tight font-bold">No hay alertas activas en {usuario.region}</h1>
          <p className="text-barro-suave">Aprovecha para revisar tu mochila de emergencia y tu plan familiar.</p>
        </section>
      )}

      <a
        href="tel:911"
        className="tarjeta flex min-h-14 items-center gap-3 px-4 py-3 text-barro no-underline"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-riesgo-critico text-white">
          <Icono nombre="telefono" tam={20} grosor={2.2} />
        </span>
        <span className="flex flex-1 flex-col">
          <span className="font-bold">¿Tu vida corre peligro?</span>
          <span className="text-nota text-tenue">Llama al 911 antes de reportar</span>
        </span>
        <span className="text-subtitulo font-bold text-riesgo-critico">911</span>
      </a>

      {restoRegion.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-subtitulo font-bold">Más alertas en {usuario.region}</h2>
          {restoRegion.map((a) => <AlertaCompacta key={a.id} alerta={a} />)}
        </section>
      )}

      <section className="flex flex-col gap-2.5">
        <h2 className="text-subtitulo font-bold">Otras alertas en Oaxaca</h2>
        {otras.length === 0 && <p className="text-tenue">No hay alertas activas en otras regiones.</p>}
        {otras.map((a) => <AlertaCompacta key={a.id} alerta={a} />)}
      </section>
    </div>
  )
}
