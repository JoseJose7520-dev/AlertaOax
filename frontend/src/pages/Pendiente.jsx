/** Marcador de posición para los módulos que se construyen en sprints posteriores. */
export default function Pendiente({ titulo, sprint }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h1 className="text-xl font-bold">{titulo}</h1>
      <p className="mt-2 text-sm text-slate-500">Este módulo se desarrolla en el {sprint}.</p>
    </div>
  )
}
