import { useEffect, useRef, useState } from 'react'
import Aviso from './Aviso.jsx'
import Icono from './Icono.jsx'

const LARGO = 6

/** Oculta la parte central del correo: felixeliel@gmail.com → fel***@gmail.com */
const ocultarCorreo = (c) => c.replace(/^(.{1,3})[^@]*(@.*)$/, '$1***$2')

/**
 * Pantalla para escribir el código de 6 dígitos que llegó por correo.
 * - Cada dígito tiene su casilla; avanza sola, se borra hacia atrás y acepta pegar el código completo.
 * - «Reenviar código» se habilita después de un minuto (el servidor aplica la misma espera).
 */
export default function CodigoVerificacion({ correo, onVerificar, onReenviar, onCambiarCorreo, onVolver, aviso }) {
  const [digitos, setDigitos] = useState(() => Array(LARGO).fill(''))
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState(aviso ?? '')
  const [espera, setEspera] = useState(60)
  const casillas = useRef([])

  useEffect(() => { casillas.current[0]?.focus() }, [])
  useEffect(() => {
    if (espera <= 0) return undefined
    const t = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [espera])

  const codigo = digitos.join('')

  async function verificar(valor = codigo) {
    if (valor.length !== LARGO) { setError('Escribe los 6 números del código.'); return }
    setError(''); setEnviando(true)
    try {
      await onVerificar(valor)
    } catch (err) {
      setError(err.message)
      if (err.datos?.codigoVencido) setEspera(0)
      setDigitos(Array(LARGO).fill(''))
      casillas.current[0]?.focus()
    } finally {
      setEnviando(false)
    }
  }

  function escribir(i, valor) {
    const solo = valor.replace(/\D/g, '')
    if (!solo) { setDigitos((d) => d.map((x, j) => (j === i ? '' : x))); return }
    // Pegado o autocompletado del teléfono: reparte los dígitos desde esta casilla
    const nuevos = [...digitos]
    for (let k = 0; k < solo.length && i + k < LARGO; k++) nuevos[i + k] = solo[k]
    setDigitos(nuevos)
    const siguiente = Math.min(i + solo.length, LARGO - 1)
    casillas.current[siguiente]?.focus()
    if (nuevos.every(Boolean)) verificar(nuevos.join(''))
  }

  function tecla(i, e) {
    if (e.key === 'Backspace' && !digitos[i] && i > 0) {
      casillas.current[i - 1]?.focus()
      setDigitos((d) => d.map((x, j) => (j === i - 1 ? '' : x)))
    } else if (e.key === 'ArrowLeft' && i > 0) casillas.current[i - 1]?.focus()
    else if (e.key === 'ArrowRight' && i < LARGO - 1) casillas.current[i + 1]?.focus()
  }

  async function reenviar() {
    setError(''); setInfo('')
    try {
      const r = await onReenviar()
      setInfo(r.mensaje); setEspera(60)
      setDigitos(Array(LARGO).fill('')); casillas.current[0]?.focus()
    } catch (err) {
      setError(err.message)
      if (err.datos?.esperar) setEspera(err.datos.esperar)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); verificar() }} className="flex flex-col gap-5" noValidate>
      <div>
        <span className="icono-caja size-14 bg-acento-claro text-acento dark:text-acento-fuerte"><Icono nombre="correo" tam={30} /></span>
        <h2 className="mt-3 text-pantalla font-bold">Confirma tu correo</h2>
        <p className="mt-1.5 text-tenue">Escribe el código de 6 números que enviamos a tu correo. Vence en 10 minutos.</p>
      </div>

      <div className="rounded-2xl border border-linea bg-hundido p-4">
        <p className="text-nota text-tenue">Correo de la cuenta</p>
        <p className="mt-0.5 text-subtitulo font-bold break-all">{ocultarCorreo(correo)}</p>
        {onCambiarCorreo && (
          <>
            <button type="button" onClick={onCambiarCorreo} className="mt-2 inline-flex min-h-11 items-center font-bold text-acento underline underline-offset-2 dark:text-acento-fuerte">
              Cambiar correo
            </button>
            <p className="text-nota text-tenue">Para usar otra dirección, vuelve a llenar el registro con tu contraseña.</p>
          </>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-texto font-semibold">Código de verificación</legend>
        <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
          {digitos.map((d, i) => (
            <input
              key={i}
              ref={(el) => { casillas.current[i] = el }}
              value={d}
              onChange={(e) => escribir(i, e.target.value)}
              onKeyDown={(e) => tecla(i, e)}
              onFocus={(e) => e.target.select()}
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={LARGO}
              aria-label={`Dígito ${i + 1} de ${LARGO}`}
              className={`campo h-14 px-0 text-center text-pantalla font-bold tabular-nums ${error ? 'border-riesgo-critico' : ''}`}
            />
          ))}
        </div>
        <p className="mt-2 text-nota text-tenue">
          Puedes escribir los números, pegarlos juntos o moverte con las flechas del teclado. Si no te llegó, revisa spam o promociones.
        </p>
      </fieldset>

      <Aviso tipo="error">{error}</Aviso>
      <Aviso tipo="exito">{info}</Aviso>

      <button type="submit" className="btn-principal" disabled={enviando || codigo.length !== LARGO}>
        {enviando ? 'Verificando…' : 'Verificar correo'}
      </button>
      <button type="button" onClick={reenviar} className="btn-neutro" disabled={espera > 0}>
        {espera > 0 ? `Reenviar código en ${espera} s` : 'Reenviar código'}
      </button>
      {onVolver && (
        <button type="button" onClick={onVolver} className="mx-auto inline-flex min-h-11 items-center font-semibold text-tenue underline underline-offset-2 hover:text-tinta">
          Volver a iniciar sesión
        </button>
      )}
    </form>
  )
}
