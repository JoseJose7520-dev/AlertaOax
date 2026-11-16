import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../services/api.js'
import { TIPOS_ALERTA, fechaCorta } from '../../utils/catalogos.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'
import InsigniaNivel from '../../components/InsigniaNivel.jsx'

export default function MisAlertas() {
  const { datos, cargando, error, recargar } = useApi('/alerts/mine')
  const [aviso, setAviso] = useState({ tipo: 'info', texto: '' })

  async function finalizar(alerta) {
    if (!window.confirm(`¿Terminar la alerta "${alerta.titulo}"? Dejará de mostrarse a la población.`)) return
    try {
      const r = await api.patch(`/alerts/${alerta.id}/finalizar`)
      setAviso({ tipo: 'exito', texto: r.mensaje })
      recargar()
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message })
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-titular font-bold">Mis alertas</h1>
        <Link to="/autoridad" className="btn-principal">Nueva alerta</Link>
      </div>
      <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
      {cargando && <Cargando />}
      <Aviso tipo="error">{error}</Aviso>
      {datos && datos.alertas.length === 0 && <p className="text-tenue">Aún no has publicado alertas.</p>}
      {datos && datos.alertas.length > 0 && (
        <div className="tarjeta overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-texto">
            <thead>
              <tr className="text-left text-nota text-tenue">
                <th className="px-4 py-3 font-bold">Alerta</th>
                <th className="px-4 py-3 font-bold">Nivel</th>
                <th className="px-4 py-3 font-bold">Vigencia</th>
                <th className="px-4 py-3 font-bold">Notificados</th>
                <th className="px-4 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {datos.alertas.map((a) => (
                <tr key={a.id} className="border-t border-arena">
                  <td className="px-4 py-3">
                    <span className="block font-bold">{a.titulo}</span>
                    <span className="text-nota text-tenue">{TIPOS_ALERTA[a.tipo]} · {a.region}</span>
                  </td>
                  <td className="px-4 py-3"><InsigniaNivel nivel={a.nivel} /></td>
                  <td className="px-4 py-3">
                    {a.vigente ? `Hasta ${fechaCorta(a.vigente_hasta)}` : <span className="text-tenue">Terminó {fechaCorta(a.vigente_hasta)}</span>}
                  </td>
                  <td className="px-4 py-3">{a.notificados}</td>
                  <td className="px-4 py-3 text-right">
                    {a.vigente && (
                      <button type="button" onClick={() => finalizar(a)} className="btn-neutro min-h-10 text-nota">Terminar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
