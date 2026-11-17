import { useState } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../services/api.js'
import { fechaCorta } from '../../utils/catalogos.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'

const ESTADO = {
  pendiente: { texto: 'Pendiente', clases: 'bg-riesgo-medio-fondo text-riesgo-medio' },
  aprobada: { texto: 'Aprobada', clases: 'bg-riesgo-bajo-fondo text-ok-texto' },
  rechazada: { texto: 'Rechazada', clases: 'bg-crema text-barro-suave' },
}

export default function Autoridades() {
  const [filtro, setFiltro] = useState('pendiente')
  const { datos, cargando, error, recargar } = useApi(`/admin/authorities${filtro ? `?estado=${filtro}` : ''}`)
  const [aviso, setAviso] = useState({ tipo: 'info', texto: '' })

  async function decidir(autoridad, decision) {
    try {
      const r = await api.put(`/admin/authorities/${autoridad.id}/validate`, { decision })
      setAviso({ tipo: 'exito', texto: `${r.mensaje} (${autoridad.nombre})` })
      recargar()
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message })
    }
  }

  return (
    <section className="flex max-w-5xl flex-col gap-4">
      <h1 className="text-titular font-bold">Solicitudes de autoridad</h1>
      <p className="text-tenue">Antes de aprobar, confirma por teléfono o correo institucional que la persona trabaja donde dice.</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar solicitudes">
        {[['pendiente', 'Pendientes'], ['aprobada', 'Aprobadas'], ['rechazada', 'Rechazadas'], ['', 'Todas']].map(([v, t]) => (
          <button
            key={t}
            type="button"
            aria-pressed={filtro === v}
            onClick={() => setFiltro(v)}
            className={`min-h-11 rounded-full border-[1.5px] px-4 ${filtro === v ? 'border-anil bg-anil font-bold text-white' : 'border-borde bg-white'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
      {cargando && <Cargando />}
      <Aviso tipo="error">{error}</Aviso>
      {datos?.autoridades.length === 0 && <p className="text-tenue">No hay solicitudes con este filtro.</p>}
      {datos?.autoridades.length > 0 && (
        <div className="tarjeta overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-texto">
            <thead>
              <tr className="text-left text-nota text-tenue">
                <th className="px-4 py-3 font-bold">Persona</th>
                <th className="px-4 py-3 font-bold">Institución y cargo</th>
                <th className="px-4 py-3 font-bold">Región</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-4 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {datos.autoridades.map((a) => (
                <tr key={a.id} className="border-t border-arena align-top">
                  <td className="px-4 py-3">
                    <span className="block font-bold">{a.nombre}</span>
                    <span className="text-nota text-tenue">{a.correo} · {fechaCorta(a.creado_en)}</span>
                  </td>
                  <td className="px-4 py-3">{a.institucion}</td>
                  <td className="px-4 py-3">{a.region}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-nota font-bold ${ESTADO[a.estado_validacion].clases}`}>
                      {ESTADO[a.estado_validacion].texto}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {a.estado_validacion !== 'rechazada' && (
                        <button type="button" onClick={() => decidir(a, 'rechazada')} className="btn-neutro min-h-11 text-nota">Rechazar</button>
                      )}
                      {a.estado_validacion !== 'aprobada' && (
                        <button type="button" onClick={() => decidir(a, 'aprobada')} className="btn-principal min-h-11 text-nota">Aprobar</button>
                      )}
                    </div>
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
