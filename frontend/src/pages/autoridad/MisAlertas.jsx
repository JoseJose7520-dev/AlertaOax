import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../services/api.js'
import { ICONO_TIPO, NIVELES, TIPOS_ALERTA, fechaCorta, haceCuanto } from '../../utils/catalogos.js'
import Aviso from '../../components/Aviso.jsx'
import Cargando from '../../components/Cargando.jsx'
import Confirmar from '../../components/Confirmar.jsx'
import Encabezado, { Filtros } from '../../components/Encabezado.jsx'
import Icono from '../../components/Icono.jsx'
import InsigniaNivel from '../../components/InsigniaNivel.jsx'

function Dato({ etiqueta, valor, icono }) {
  return (
    <div className="tarjeta flex items-center gap-3 p-4">
      <span className="icono-caja size-11 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre={icono} tam={24} /></span>
      <span className="flex flex-col">
        <span className="text-pantalla font-bold leading-none">{valor}</span>
        <span className="text-nota text-tenue">{etiqueta}</span>
      </span>
    </div>
  )
}

/** Alerta publicada: franja de nivel, vigencia, personas notificadas y botón Terminar. */
function TarjetaPublicada({ a, onTerminar }) {
  const n = NIVELES[a.nivel] ?? NIVELES.vigilancia
  return (
    <li className={`tarjeta relative flex flex-col gap-3 overflow-hidden p-4 pl-5 md:flex-row md:items-center md:gap-4 ${a.vigente ? '' : 'opacity-75'}`}>
      <span className={`absolute inset-y-0 left-0 w-1.5 ${a.vigente ? n.clases.solido : 'bg-linea-fuerte'}`} aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className={`icono-caja size-11 shrink-0 ${n.clases.fondo} ${n.clases.texto}`}><Icono nombre={ICONO_TIPO[a.tipo] ?? 'alerta'} tam={24} /></span>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <InsigniaNivel nivel={a.nivel} />
            {a.vigente
              ? <span className="inline-flex items-center gap-1 rounded-full bg-riesgo-bajo-fondo px-2 py-0.5 text-nota font-bold text-ok-texto"><span className="size-1.5 rounded-full bg-riesgo-bajo" aria-hidden="true" /> Vigente</span>
              : <span className="rounded-full bg-hundido px-2 py-0.5 text-nota font-bold text-tinta-suave">Terminada</span>}
          </span>
          <span className="text-subtitulo font-bold">{a.titulo}</span>
          <span className="text-nota text-tenue">
            {TIPOS_ALERTA[a.tipo]} · {a.region} · publicada {haceCuanto(a.emitida_en)} · {a.vigente ? `hasta ${fechaCorta(a.vigente_hasta)}` : `terminó ${fechaCorta(a.vigente_hasta)}`}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 md:shrink-0 md:justify-end">
        <span className="flex items-center gap-1.5 text-nota text-tinta-suave" title="Personas notificadas">
          <Icono nombre="campana" tam={18} className="text-tenue" /> <strong className="text-texto">{a.notificados}</strong> notificadas
        </span>
        {a.vigente && (
          <button type="button" onClick={() => onTerminar(a)} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border-[1.5px] border-riesgo-critico/50 px-3.5 text-nota font-bold text-riesgo-critico-texto hover:bg-riesgo-critico-fondo">
            <Icono nombre="cerrar" tam={16} peso="bold" /> Terminar
          </button>
        )}
      </div>
    </li>
  )
}

export default function MisAlertas() {
  const { datos, cargando, error, recargar } = useApi('/alerts/mine')
  const [aviso, setAviso] = useState({ tipo: 'info', texto: '' })
  const [filtro, setFiltro] = useState('vigentes')
  const [terminando, setTerminando] = useState(null)
  const [enviando, setEnviando] = useState(false)

  async function terminar() {
    setEnviando(true)
    try {
      const r = await api.patch(`/alerts/${terminando.id}/finalizar`)
      setAviso({ tipo: 'exito', texto: r.mensaje })
      recargar()
    } catch (err) {
      setAviso({ tipo: 'error', texto: err.message })
    } finally {
      setEnviando(false); setTerminando(null)
    }
  }

  const alertas = datos?.alertas ?? []
  const vigentes = alertas.filter((a) => a.vigente)
  const lista = filtro === 'vigentes' ? vigentes : filtro === 'terminadas' ? alertas.filter((a) => !a.vigente) : alertas
  const notificados = alertas.reduce((s, a) => s + Number(a.notificados || 0), 0)

  return (
    <section className="flex max-w-5xl flex-col gap-4">
      <Encabezado rotulo="Panel de autoridad" titulo="Mis alertas" icono="lista"
        acciones={<Link to="/autoridad" className="btn-principal"><Icono nombre="megafono" tam={20} peso="fill" /> Nueva alerta</Link>}>
        Alertas que publicaste. Termina una alerta si el riesgo pasó antes de lo previsto.
      </Encabezado>
      {datos && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
          <Dato etiqueta="Vigentes ahora" valor={vigentes.length} icono="sirena" />
          <Dato etiqueta="Publicadas en total" valor={alertas.length} icono="megafono" />
          <Dato etiqueta="Personas notificadas" valor={notificados} icono="campana" />
        </div>
      )}
      <Filtros etiqueta="Filtrar alertas" valor={filtro} onCambio={setFiltro}
        opciones={[['vigentes', `Vigentes (${vigentes.length})`], ['terminadas', 'Terminadas'], ['todas', 'Todas']]} />
      <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>
      {cargando && <Cargando />}
      <Aviso tipo="error">{error}</Aviso>
      {datos && lista.length === 0 && (
        <p className="tarjeta p-5 text-tenue">{alertas.length === 0 ? 'Aún no has publicado alertas.' : 'No hay alertas con este filtro.'}</p>
      )}
      {lista.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {lista.map((a) => <TarjetaPublicada key={a.id} a={a} onTerminar={setTerminando} />)}
        </ul>
      )}
      <Confirmar
        abierto={terminando !== null}
        icono="cerrar"
        tono="peligro"
        titulo="¿Terminar esta alerta?"
        textoConfirmar="Sí, terminar"
        textoCancelar="Cancelar"
        enviando={enviando}
        onConfirmar={terminar}
        onCancelar={() => setTerminando(null)}
      >
        {terminando && (
          <>
            <p><strong className="text-tinta">{terminando.titulo}</strong> · {terminando.region}</p>
            <p>Dejará de mostrarse a la población de inmediato. Hazlo solo si el riesgo ya pasó.</p>
          </>
        )}
      </Confirmar>
    </section>
  )
}
