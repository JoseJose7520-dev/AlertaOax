import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../services/api.js'
import { fechaCorta } from '../../utils/catalogos.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'
import Confirmar from '../../components/Confirmar.jsx'
import Encabezado, { Filtros } from '../../components/Encabezado.jsx'
import Icono from '../../components/Icono.jsx'

const ROL = {
  ciudadano: { texto: 'Ciudadano', clases: 'bg-hundido text-tinta-suave', icono: 'comunidad' },
  autoridad: { texto: 'Autoridad', clases: 'bg-riesgo-bajo-fondo text-ok-texto', icono: 'escudo' },
  administrador: { texto: 'Administrador', clases: 'bg-acento-claro text-acento dark:text-acento-fuerte', icono: 'escudo' },
}
const VALIDACION = { pendiente: 'pendiente', rechazada: 'rechazada' }

/** Botón Activar/Desactivar de una fila. Siempre pide confirmación (AO-424). */
function BotonActivo({ u, esYo, alCambiar }) {
  const [abierto, setAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  if (esYo) return <span className="text-nota text-tenue">Tu cuenta</span>
  const desactivar = u.activo

  async function confirmar() {
    setEnviando(true); setError('')
    try {
      const r = await api.patch(`/admin/users/${u.id}/activo`, { activo: !u.activo })
      setAbierto(false)
      alCambiar(r.mensaje)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <button type="button" onClick={() => { setError(''); setAbierto(true) }}
        className={`inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-nota font-bold ${desactivar ? 'border-riesgo-critico/40 text-riesgo-critico-texto hover:bg-riesgo-critico-fondo' : 'border-linea text-ok-texto hover:bg-riesgo-bajo-fondo'}`}
        aria-label={`${desactivar ? 'Desactivar' : 'Activar'} la cuenta de ${u.nombre}`}>
        <Icono nombre={desactivar ? 'bloquear' : 'activar'} tam={18} /> {desactivar ? 'Desactivar' : 'Activar'}
      </button>
      <Confirmar
        abierto={abierto}
        titulo={desactivar ? `¿Desactivar la cuenta de ${u.nombre}?` : `¿Activar la cuenta de ${u.nombre}?`}
        tono={desactivar ? 'peligro' : 'normal'}
        icono={desactivar ? 'bloquear' : 'activar'}
        textoConfirmar={desactivar ? 'Sí, desactivar' : 'Sí, activar'}
        textoCancelar="Cancelar"
        enviando={enviando}
        onConfirmar={confirmar}
        onCancelar={() => setAbierto(false)}
      >
        {desactivar ? (
          <>
            <p>{u.correo} ya no podrá iniciar sesión y se cerrarán sus sesiones abiertas en todos sus dispositivos.</p>
            <p>Sus datos no se borran: puedes volver a activarla cuando quieras.</p>
          </>
        ) : (
          <p>{u.correo} podrá volver a iniciar sesión con sus datos de siempre.</p>
        )}
        <Aviso tipo="error">{error}</Aviso>
      </Confirmar>
    </>
  )
}

/** Listado de todas las cuentas registradas, con búsqueda y filtro por rol. */
export default function Usuarios() {
  const { usuario: yo } = useAuth()
  const [exito, setExito] = useState('')
  // ?rol=ciudadano (desde la tarjeta «Ciudadanos registrados» del resumen)
  const [url] = useSearchParams()
  const [rol, setRol] = useState(() => (['ciudadano', 'autoridad', 'administrador'].includes(url.get('rol')) ? url.get('rol') : ''))
  const [texto, setTexto] = useState('')
  const [buscar, setBuscar] = useState('')
  const [pagina, setPagina] = useState(1)

  // Espera a que la persona deje de escribir antes de buscar
  useEffect(() => {
    const t = setTimeout(() => { setBuscar(texto.trim()); setPagina(1) }, 350)
    return () => clearTimeout(t)
  }, [texto])

  const params = new URLSearchParams({ pagina: String(pagina) })
  if (rol) params.set('rol', rol)
  if (buscar) params.set('buscar', buscar)
  const { datos, cargando, error, recargar } = useApi(`/admin/users?${params}`)
  const paginas = datos ? Math.max(1, Math.ceil(datos.total / datos.porPagina)) : 1

  return (
    <section className="flex max-w-6xl flex-col gap-4">
      <Encabezado rotulo="Administración" titulo="Usuarios" icono="usuarios">
        Todas las cuentas registradas en AlertaOax. Desde aquí puedes desactivar o volver a activar una cuenta; las autoridades se aprueban en «Autoridades».
      </Encabezado>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[16rem] flex-1">
          <span className="sr-only">Buscar por nombre o correo</span>
          <Icono nombre="buscar" tam={20} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tenue" />
          <input className="campo pl-11" type="search" placeholder="Buscar por nombre o correo" value={texto} onChange={(e) => setTexto(e.target.value)} />
        </label>
        <Filtros etiqueta="Filtrar por rol" valor={rol} onCambio={(v) => { setRol(v); setPagina(1) }}
          opciones={[['', 'Todos'], ['ciudadano', 'Ciudadanos'], ['autoridad', 'Autoridades'], ['administrador', 'Administradores']]} />
      </div>
      <Aviso tipo="error">{error}</Aviso>
      <Aviso tipo="exito">{exito}</Aviso>
      {cargando && !datos && <Cargando />}
      {datos && (
        <>
          <p className="rotulo text-tenue">{datos.total} {datos.total === 1 ? 'cuenta' : 'cuentas'}</p>
          {datos.usuarios.length === 0 ? (
            <p className="text-tenue">No hay cuentas con estos filtros.</p>
          ) : (
            <div className="tarjeta overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-texto">
                <thead>
                  <tr className="rotulo bg-hundido/70 text-left text-tenue">
                    <th className="px-4 py-3">Persona</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Región</th>
                    <th className="px-4 py-3">Acceso</th>
                    <th className="px-4 py-3">Registro</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.usuarios.map((u) => {
                    const r = ROL[u.rol]
                    return (
                      <tr key={u.id} className={`border-t border-linea align-middle ${u.activo ? '' : 'bg-hundido/50 text-tenue'}`}>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-acento-claro font-bold text-acento dark:text-acento-fuerte" aria-hidden="true">
                              {u.nombre.trim().charAt(0).toUpperCase()}
                            </span>
                            <span className="min-w-0">
                              <span className="block font-semibold">{u.nombre}</span>
                              <span className="block truncate text-nota text-tenue">{u.correo}</span>
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-nota font-bold ${r.clases}`}>
                            <Icono nombre={r.icono} tam={15} peso="fill" /> {r.texto}
                          </span>
                          {VALIDACION[u.estado_validacion] && <span className="ml-2 text-nota text-riesgo-medio-texto">(solicitud de autoridad {u.estado_validacion})</span>}
                        </td>
                        <td className="px-4 py-3">{u.region ?? '—'}</td>
                        <td className="px-4 py-3 text-nota">{u.con_google ? 'Google' : 'Correo y contraseña'}</td>
                        <td className="px-4 py-3 text-nota text-tenue">{fechaCorta(u.creado_en)}</td>
                        <td className="px-4 py-3">
                          <span className="flex flex-col items-start gap-1.5">
                            <span className={`rounded-full px-2.5 py-0.5 text-nota font-bold ${u.activo ? 'bg-riesgo-bajo-fondo text-ok-texto' : 'bg-riesgo-critico-fondo text-riesgo-critico-texto'}`}>
                              {u.activo ? 'Activa' : 'Desactivada'}
                            </span>
                            <BotonActivo u={u} esYo={u.id === yo?.id} alCambiar={(m) => { setExito(m); recargar() }} />
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {paginas > 1 && (
            <nav aria-label="Páginas" className="flex items-center justify-end gap-2">
              <button type="button" className="btn-neutro" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>Anterior</button>
              <span className="text-nota text-tenue">Página {pagina} de {paginas}</span>
              <button type="button" className="btn-neutro" disabled={pagina >= paginas} onClick={() => setPagina((p) => p + 1)}>Siguiente</button>
            </nav>
          )}
        </>
      )}
    </section>
  )
}
