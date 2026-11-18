import { Link } from 'react-router-dom'
import { useRegionActiva } from '../hooks/useRegionActiva.js'
import { useApi } from '../hooks/useApi.js'
import { AlertaCompacta, AlertaDestacada } from '../components/TarjetaAlerta.jsx'
import Aviso from '../components/Aviso.jsx'
import Cargando from '../components/Cargando.jsx'
import Icono from '../components/Icono.jsx'

export default function Inicio() {
  const { region, propia, cambiarRegion } = useRegionActiva()
  // Se vuelve a consultar cada 60 s: si se publica una alerta, aparece sin recargar la página
  const todas = useApi('/alerts/active?todas=1', { intervalo: 60000 })

  if (todas.cargando) return <Cargando texto="Buscando alertas…" />
  if (todas.error) return <Aviso tipo="error">{todas.error}</Aviso>

  const alertas = todas.datos.alertas
  const deMiRegion = alertas.filter((a) => a.region === region)
  const otras = alertas.filter((a) => a.region !== region)
  const [principal, ...restoRegion] = deMiRegion

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="rotulo flex items-center gap-2 text-tenue">
          <span className="size-2 rounded-full bg-riesgo-bajo shadow-[0_0_0_4px_rgb(5_150_105/0.22)]" aria-hidden="true" /> Estado regional · en vivo
        </p>
        <h2 className="mt-1 text-pantalla font-bold">Región {region}</h2>
      </div>

      {region !== propia && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-acento/30 bg-acento-suave px-4 py-3 text-nota" role="status">
          <Icono nombre="info" tam={20} className="text-acento dark:text-acento-fuerte" />
          <span className="flex-1">Estás consultando <strong>{region}</strong>. Tus notificaciones siguen llegando de <strong>{propia}</strong>.</span>
          <button type="button" onClick={() => cambiarRegion(propia)} className="min-h-10 font-bold text-acento dark:text-acento-fuerte">Volver a {propia}</button>
        </div>
      )}

      {principal ? (
        <AlertaDestacada alerta={principal} />
      ) : (
        <section className="topografia relative flex flex-col gap-3 overflow-hidden rounded-3xl border-2 border-riesgo-bajo/60 bg-riesgo-bajo-fondo p-5 sm:p-6">
          <p className="flex items-center gap-2 text-nota font-bold tracking-wide text-ok-texto">
            <Icono nombre="ok" tam={20} peso="fill" /> SIN ALERTAS · VIGILANCIA NORMAL
          </p>
          <h1 className="text-titular font-bold">No hay alertas activas en {region}</h1>
          <p className="text-tinta-suave">Aprovecha para revisar tu mochila de emergencia y tu plan familiar.</p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Link to="/preparate" className="btn-secundario"><Icono nombre="mochila" tam={20} /> Revisar mi mochila</Link>
            <Link to="/mapa" className="btn-neutro"><Icono nombre="mapa" tam={20} /> Ver albergues</Link>
          </div>
        </section>
      )}

      {restoRegion.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="text-subtitulo font-bold">Más alertas en {region}</h2>
          {restoRegion.map((a) => <AlertaCompacta key={a.id} alerta={a} />)}
        </section>
      )}

      <section className="flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-subtitulo font-bold">Otras alertas en Oaxaca</h2>
          <span className="rotulo text-tenue">{otras.length} activas</span>
        </div>
        {otras.length === 0 && <p className="tarjeta px-4 py-4 text-tenue">No hay alertas activas en otras regiones.</p>}
        <div className="grid gap-2.5 lg:grid-cols-2">
          {otras.map((a) => <AlertaCompacta key={a.id} alerta={a} />)}
        </div>
      </section>
    </div>
  )
}
