import { IconoPersonas, IconoEscudoSimple } from '../Iconos.jsx'
import { ROLES } from '../../utils/constantes.js'

const PERFILES = [
  {
    valor: ROLES.CIUDADANO,
    titulo: 'Soy ciudadano',
    etiqueta: 'Público e inmediato',
    descripcion: 'Alertas locales, reportes vecinales y planes familiares de auxilio.',
    icono: IconoPersonas,
  },
  {
    valor: ROLES.AUTORIDAD,
    titulo: 'Soy autoridad',
    etiqueta: 'Requiere acreditación',
    descripcion: 'Protección Civil, Bomberos, Brigadistas, Enlaces y directivos.',
    icono: IconoEscudoSimple,
  },
]

/** Elección del perfil de acceso (ciudadano o autoridad). Es un grupo de radios accesible. */
export default function SelectorPerfil({ valor, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[11px] font-semibold text-slate-500">Selecciona tu perfil de acceso</legend>
      <div className="grid grid-cols-2 gap-3" role="radiogroup">
        {PERFILES.map(({ valor: v, titulo, etiqueta, descripcion, icono: Icono }) => {
          const activo = valor === v
          return (
            <label
              key={v}
              className={`relative flex cursor-pointer flex-col gap-2 rounded-xl border-2 p-3 transition focus-within:ring-2 focus-within:ring-oax-200 ${
                activo ? 'border-oax-700 bg-white' : 'border-transparent bg-slate-100 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio" name="perfil" value={v} checked={activo}
                onChange={() => onChange(v)} className="sr-only"
              />
              <span className="flex items-start justify-between gap-1">
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${activo ? 'bg-oax-700 text-white' : 'bg-white text-slate-500'}`}>
                  <Icono />
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${activo ? 'bg-oax-100 text-oax-700' : 'bg-white text-slate-500'}`}>
                  {etiqueta}
                </span>
              </span>
              <span className="text-sm font-bold">{titulo}</span>
              <span className="text-[11px] leading-snug text-slate-500">{descripcion}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
