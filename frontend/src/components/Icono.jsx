import {
  ArrowLeft, ArrowRight, Backpack, Bell, Broadcast, CaretLeft, CaretRight, ChartBar, Check, CheckCircle,
  ClipboardText, Clock, Envelope, Eye, EyeSlash, FileText, HouseLine, House, Hurricane, Info, Lifebuoy,
  Lightning, ListBullets, LockKey, MagnifyingGlass, MapPin, MapTrifold, Megaphone, Moon, Mountains,
  NavigationArrow, Phone, PlusCircle, Pulse, Question, ShareNetwork, ShieldCheck, SignOut, Siren, Sun,
  Tree, User, Users, UsersThree, Warning, WarningOctagon, Waves, X, Camera, Target, UserCircle,
  Drop, ForkKnife, Flashlight, Radio, FirstAidKit, IdentificationCard, TShirt, Money, Timer, Heartbeat, ArrowsClockwise,
  WhatsappLogo, ChatCircleDots, Cookie, Crosshair, CaretDown,
} from '@phosphor-icons/react'

// Íconos duotono (Phosphor). Los nombres en español son los que usa toda la app.
const ICONOS = {
  abajo: CaretDown, whatsapp: WhatsappLogo, contacto: ChatCircleDots, galleta: Cookie, mira: Crosshair,
  campana: Bell, mapa: MapTrifold, mochila: Backpack, mas: PlusCircle, ubicacion: MapPin, alerta: Warning,
  flecha: ArrowRight, atras: CaretLeft, derecha: CaretRight, regresar: ArrowLeft, telefono: Phone, casa: House,
  navegar: NavigationArrow, palomita: Check, salir: SignOut, camara: Camera, usuario: User, usuarios: Users,
  comunidad: UsersThree, escudo: ShieldCheck, grafica: ChartBar, lista: ListBullets, sismo: Pulse,
  inundacion: Waves, huracan: Hurricane, deslizamiento: Mountains, deslave: Mountains, arbol: Tree,
  cable: Lightning, vivienda: HouseLine, otro: Question, cerrar: X, ojo: Eye, ojoTachado: EyeSlash,
  sol: Sun, luna: Moon, correo: Envelope, candado: LockKey, radar: Broadcast, sirena: Siren,
  documento: FileText, salvavidas: Lifebuoy, ok: CheckCircle, reloj: Clock, megafono: Megaphone,
  reporte: ClipboardText, buscar: MagnifyingGlass, critico: WarningOctagon, info: Info, compartir: ShareNetwork,
  objetivo: Target, perfil: UserCircle,
  agua: Drop, comida: ForkKnife, linterna: Flashlight, radio: Radio, botiquin: FirstAidKit, documentos: IdentificationCard,
  ropa: TShirt, efectivo: Money, antes: Timer, durante: Heartbeat, despues: ArrowsClockwise,
}

/**
 * Ícono decorativo por defecto (aria-hidden). Con `etiqueta` se anuncia a lectores de pantalla.
 * `peso`: 'duotone' (por defecto), 'fill', 'bold' o 'regular'.
 */
export default function Icono({ nombre, tam = 24, peso = 'duotone', className = '', etiqueta }) {
  const Componente = ICONOS[nombre] ?? Question
  return (
    <Componente
      size={tam}
      weight={peso}
      className={`shrink-0 ${className}`}
      {...(etiqueta ? { role: 'img', 'aria-label': etiqueta } : { 'aria-hidden': true })}
    />
  )
}
