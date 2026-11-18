import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'
import Encabezado, { Filtros } from '../../components/Encabezado.jsx'
import Icono from '../../components/Icono.jsx'
import ListaSolicitudes from '../../components/ListaSolicitudes.jsx'

export default function Autoridades() {
  const [filtro, setFiltro] = useState('pendiente')
  const { datos, cargando, error, recargar } = useApi(`/admin/authorities${filtro ? `?estado=${filtro}` : ''}`)
  const [aviso, setAviso] = useState({ tipo: 'info', texto: '' })

  return (
    <section className="flex max-w-5xl flex-col gap-4">
      <Encabezado rotulo="Administración · Validación" titulo="Solicitudes de autoridad" icono="escudo"
        acciones={<Link to="/admin/usuarios" className="btn-neutro"><Icono nombre="usuarios" tam={20} /> Ver todas las cuentas</Link>}>
        Antes de aprobar, confirma por teléfono o correo institucional que la persona trabaja donde dice.
      </Encabezado>
      <Filtros etiqueta="Filtrar solicitudes" valor={filtro} onCambio={setFiltro}
        opciones={[['pendiente', 'Pendientes'], ['aprobada', 'Aprobadas'], ['rechazada', 'Rechazadas'], ['', 'Todas']]} />
      <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
      {cargando && <Cargando />}
      <Aviso tipo="error">{error}</Aviso>
      {datos?.autoridades.length === 0 && (
        <div className="tarjeta flex items-center gap-3 p-5 text-tenue">
          <span className="icono-caja size-11 bg-riesgo-bajo-fondo text-ok-texto"><Icono nombre="ok" tam={24} /></span>
          {filtro === 'pendiente' ? 'No hay solicitudes por revisar. ¡Todo al día!' : 'No hay solicitudes con este filtro.'}
        </div>
      )}
      {datos?.autoridades.length > 0 && (
        <ListaSolicitudes autoridades={datos.autoridades}
          onDecidido={(m) => { setAviso({ tipo: 'exito', texto: m }); recargar() }}
          onError={(m) => setAviso({ tipo: 'error', texto: m })} />
      )}
    </section>
  )
}
