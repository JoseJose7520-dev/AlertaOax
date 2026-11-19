import { useEffect, useState } from 'react'
import { useApi } from '../../hooks/useApi.js'
import { fechaCorta } from '../../utils/catalogos.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'
import Encabezado, { Filtros } from '../../components/Encabezado.jsx'
import Icono from '../../components/Icono.jsx'

const ROL = {
  ciudadano: { texto: 'Ciudadano', clases: 'bg-hundido text-tinta-suave', icono: 'comunidad' },
  autoridad: { texto: 'Autoridad', clases: 'bg-riesgo-bajo-fondo text-ok-texto', icono: 'escudo' },
  administrador: { texto: 'Administrador', clases: 'bg-acento-claro text-acento dark:text-acento-fuerte', icono: 'escudo' },
}
const VALIDACION = { pendiente: 'pendiente', rechazada: 'rechazada' }

/** Listado de todas las cuentas registradas, con búsqueda y filtro por rol. */
export default function Usuarios() {
  const [rol, setRol] = useState('')
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
  const { datos, cargando, error } = useApi(`/admin/users?${params}`)
  const paginas = datos ? Math.max(1, Math.ceil(datos.total / datos.porPagina)) : 1

  return (
    <section className="flex max-w-6xl flex-col gap-4">
      <Encabezado rotulo="Administración" titulo="Usuarios" icono="usuarios">
        Todas las cuentas registradas en AlertaOax. Las autoridades se aprueban en «Autoridades».
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
      {cargando && !datos && <Cargando />}
      {datos && (
        <>
          <p className="rotulo text-tenue">{datos.total} {datos.total === 1 ? 'cuenta' : 'cuentas'}</p>
          {datos.usuarios.length === 0 ? (
            <p className="text-tenue">No hay cuentas con estos filtros.</p>
          ) : (
            <div className="tarjeta overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-texto">
                <thead>
                  <tr className="rotulo bg-hundido/70 text-left text-tenue">
                    <th className="px-4 py-3">Persona</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Región</th>
                    <th className="px-4 py-3">Acceso</th>
                    <th className="px-4 py-3">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.usuarios.map((u) => {
                    const r = ROL[u.rol]
                    return (
                      <tr key={u.id} className="border-t border-linea align-middle">
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
                          {VALIDACION[u.estado_validacion] && <span className="ml-2 text-nota text-riesgo-medio-texto">({u.estado_validacion})</span>}
                        </td>
                        <td className="px-4 py-3">{u.region ?? '—'}</td>
                        <td className="px-4 py-3 text-nota">{u.con_google ? 'Google' : 'Correo y contraseña'}</td>
                        <td className="px-4 py-3 text-nota text-tenue">{fechaCorta(u.creado_en)}</td>
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
