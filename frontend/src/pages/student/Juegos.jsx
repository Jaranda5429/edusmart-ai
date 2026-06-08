import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'

const NAV = [
  { icon: '🏠', label: 'Inicio', path: '/estudiante/dashboard' },
  { icon: '📚', label: 'Mis Cursos', path: '/estudiante/cursos' },
  { icon: '📝', label: 'Tareas', path: '/estudiante/tareas' },
  { icon: '📈', label: 'Progreso', path: '/estudiante/progreso' },
  { icon: '🎮', label: 'Juegos', path: '/estudiante/juegos' },
  { icon: '🔔', label: 'Notificaciones', path: '/estudiante/notificaciones' },
]

// ─── PREGUNTAS DE TRIVIA ───────────────────────────────
const PREGUNTAS = [
  { pregunta: '¿Cuál es la capital de Colombia?', opciones: ['Medellín', 'Bogotá', 'Cali', 'Barranquilla'], correcta: 1 },
  { pregunta: '¿Cuánto es 7 x 8?', opciones: ['54', '56', '58', '64'], correcta: 1 },
  { pregunta: '¿Qué planeta es el más grande del sistema solar?', opciones: ['Saturno', 'Tierra', 'Júpiter', 'Marte'], correcta: 2 },
  { pregunta: '¿Quién escribió "Cien años de soledad"?', opciones: ['Pablo Neruda', 'Gabriel García Márquez', 'Mario Vargas Llosa', 'Jorge Luis Borges'], correcta: 1 },
  { pregunta: '¿Cuál es el río más largo del mundo?', opciones: ['Nilo', 'Amazonas', 'Misisipi', 'Yangtsé'], correcta: 1 },
  { pregunta: '¿En qué año llegó el hombre a la Luna?', opciones: ['1965', '1969', '1972', '1959'], correcta: 1 },
  { pregunta: '¿Cuántos lados tiene un hexágono?', opciones: ['5', '6', '7', '8'], correcta: 1 },
  { pregunta: '¿Cuál es el elemento químico con símbolo O?', opciones: ['Oro', 'Osmio', 'Oxígeno', 'Otro'], correcta: 2 },
]

// ─── JUEGO: TRIVIA ─────────────────────────────────────
function Trivia({ onVolver }) {
  const [indice, setIndice] = useState(0)
  const [puntos, setPuntos] = useState(0)
  const [seleccion, setSeleccion] = useState(null)
  const [terminado, setTerminado] = useState(false)

  const pregunta = PREGUNTAS[indice]

  const responder = (i) => {
    if (seleccion !== null) return  // ya respondió, no deja volver a clickear
    setSeleccion(i)
    if (i === pregunta.correcta) setPuntos(p => p + 1)
    // Espera 1 segundo antes de avanzar para que vea si acertó
    setTimeout(() => {
      if (indice + 1 < PREGUNTAS.length) {
        setIndice(indice + 1)
        setSeleccion(null)
      } else {
        setTerminado(true)
      }
    }, 1000)
  }

  const reiniciar = () => {
    setIndice(0); setPuntos(0); setSeleccion(null); setTerminado(false)
  }

  if (terminado) {
    const pct = Math.round((puntos / PREGUNTAS.length) * 100)
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-lg mx-auto">
        <span className="text-6xl">{pct >= 70 ? '🏆' : pct >= 40 ? '👍' : '💪'}</span>
        <h3 className="text-2xl font-black text-gray-800 mt-4">¡Terminaste!</h3>
        <p className="text-gray-500 mt-2">Acertaste</p>
        <p className="text-5xl font-black text-purple-600 my-3">{puntos}/{PREGUNTAS.length}</p>
        <div className="flex gap-3 mt-6">
          <button onClick={onVolver} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50">Salir</button>
          <button onClick={reiniciar} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md">Jugar de nuevo</button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold text-gray-400">Pregunta {indice + 1} de {PREGUNTAS.length}</span>
        <span className="text-sm font-bold text-purple-600">⭐ {puntos} puntos</span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: ((indice + 1) / PREGUNTAS.length * 100) + '%' }} />
      </div>

      <h3 className="text-xl font-bold text-gray-800 mb-6">{pregunta.pregunta}</h3>

      <div className="space-y-3">
        {pregunta.opciones.map((op, i) => {
          let cls = 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
          if (seleccion !== null) {
            if (i === pregunta.correcta) cls = 'border-green-400 bg-green-50 text-green-700'
            else if (i === seleccion) cls = 'border-red-400 bg-red-50 text-red-700'
            else cls = 'border-gray-200 opacity-50'
          }
          return (
            <button key={i} onClick={() => responder(i)} disabled={seleccion !== null}
              className={'w-full text-left px-5 py-4 rounded-xl border-2 font-semibold transition-all ' + cls}>
              <span className="inline-block w-7 h-7 rounded-lg bg-white border border-gray-200 text-center mr-3 text-sm">{String.fromCharCode(65 + i)}</span>
              {op}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── JUEGO: AHORCADO ───────────────────────────────────
const PALABRAS = [
  { palabra: 'COLOMBIA', pista: 'Un país de Sudamérica' },
  { palabra: 'MATEMATICAS', pista: 'Materia de números' },
  { palabra: 'COMPUTADOR', pista: 'Máquina para programar' },
  { palabra: 'BIBLIOTECA', pista: 'Lugar lleno de libros' },
  { palabra: 'PROFESOR', pista: 'Quien enseña en clase' },
  { palabra: 'CIENCIA', pista: 'Estudio del mundo natural' },
  { palabra: 'PLANETA', pista: 'La Tierra es uno' },
  { palabra: 'ESTUDIANTE', pista: 'Tú eres uno' },
]

const ABECEDARIO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const MAX_ERRORES = 6
const MUNECO = ['😀', '😟', '😣', '😖', '😫', '😵', '💀']

function Ahorcado({ onVolver }) {
  const [item, setItem] = useState(() => PALABRAS[Math.floor(Math.random() * PALABRAS.length)])
  const [letrasUsadas, setLetrasUsadas] = useState([])
  const [errores, setErrores] = useState(0)

  const palabra = item.palabra
  const gano = palabra.split('').every(l => letrasUsadas.includes(l))
  const perdio = errores >= MAX_ERRORES
  const terminado = gano || perdio

  const intentar = (letra) => {
    if (letrasUsadas.includes(letra) || terminado) return
    setLetrasUsadas(prev => [...prev, letra])
    if (!palabra.includes(letra)) setErrores(prev => prev + 1)
  }

  const reiniciar = () => {
    setItem(PALABRAS[Math.floor(Math.random() * PALABRAS.length)])
    setLetrasUsadas([])
    setErrores(0)
  }

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
      {/* Muñeco + intentos */}
      <div className="text-center mb-6">
        <div className="text-7xl mb-2">{MUNECO[errores]}</div>
        <p className="text-sm text-gray-400">Errores: {errores} / {MAX_ERRORES}</p>
        <div className="flex justify-center gap-1 mt-2">
          {Array.from({ length: MAX_ERRORES }).map((_, i) => (
            <div key={i} className={'w-3 h-3 rounded-full ' + (i < errores ? 'bg-red-400' : 'bg-gray-200')} />
          ))}
        </div>
      </div>

      {/* Pista */}
      <div className="bg-purple-50 rounded-xl p-3 text-center mb-6 border border-purple-100">
        <p className="text-sm text-purple-700"><span className="font-semibold">Pista:</span> {item.pista}</p>
      </div>

      {/* Palabra con guiones */}
      <div className="flex justify-center gap-2 flex-wrap mb-8">
        {palabra.split('').map((letra, i) => (
          <div key={i} className={'w-9 h-11 border-b-4 flex items-center justify-center text-2xl font-black ' +
            (letrasUsadas.includes(letra) ? 'border-purple-400 text-gray-800' : 'border-gray-300 text-transparent')}>
            {letrasUsadas.includes(letra) ? letra : '_'}
          </div>
        ))}
      </div>

      {/* Resultado o teclado */}
      {terminado ? (
        <div className="text-center">
          <p className={'text-2xl font-black mb-1 ' + (gano ? 'text-green-600' : 'text-red-500')}>
            {gano ? '🎉 ¡Ganaste!' : '💀 Perdiste'}
          </p>
          {!gano && <p className="text-gray-500 mb-4">La palabra era: <span className="font-bold text-gray-800">{palabra}</span></p>}
          <div className="flex gap-3 mt-4">
            <button onClick={onVolver} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50">Salir</button>
            <button onClick={reiniciar} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md">Otra palabra</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
          {ABECEDARIO.map(letra => {
            const usada = letrasUsadas.includes(letra)
            const acerto = usada && palabra.includes(letra)
            return (
              <button key={letra} onClick={() => intentar(letra)} disabled={usada}
                className={'aspect-square rounded-lg font-bold text-sm transition-all ' +
                  (usada
                    ? (acerto ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-400')
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700')}>
                {letra}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── JUEGO: MEMORAMA ───────────────────────────────────
const MATERIAS_MEMO = [
  {
    id: 'matematicas', nombre: 'Matemáticas', icono: '🔢',
    niveles: [
      { nombre: 'Básico', grados: '6° - 8°', pares: [
        { a: '6 × 7', b: '42' }, { a: '8 × 8', b: '64' }, { a: '9 × 6', b: '54' },
        { a: '12 ÷ 4', b: '3' }, { a: '15 + 27', b: '42' }, { a: '100 − 36', b: '64' },
      ]},
      { nombre: 'Avanzado', grados: '9° - 11°', pares: [
        { a: '√144', b: '12' }, { a: '3²  + 4²', b: '25' }, { a: '2³ × 5', b: '40' },
        { a: 'log₁₀(1000)', b: '3' }, { a: '5! ', b: '120' }, { a: '(−3)²', b: '9' },
      ]},
    ],
  },
  {
    id: 'biologia', nombre: 'Biología', icono: '🧬',
    niveles: [
      { nombre: 'Básico', grados: '6° - 8°', pares: [
        { a: 'Fotosíntesis', b: 'Plantas hacen energía' }, { a: 'Célula', b: 'Unidad de la vida' },
        { a: 'Pulmones', b: 'Respiración' }, { a: 'Corazón', b: 'Bombea sangre' },
        { a: 'Herbívoro', b: 'Come plantas' }, { a: 'Ecosistema', b: 'Seres y su entorno' },
      ]},
      { nombre: 'Avanzado', grados: '9° - 11°', pares: [
        { a: 'Mitosis', b: 'División celular' }, { a: 'ADN', b: 'Material genético' },
        { a: 'ATP', b: 'Energía celular' }, { a: 'Ribosoma', b: 'Sintetiza proteínas' },
        { a: 'Meiosis', b: 'Forma gametos' }, { a: 'Enzima', b: 'Acelera reacciones' },
      ]},
    ],
  },
  {
    id: 'geografia', nombre: 'Geografía', icono: '🌍',
    niveles: [
      { nombre: 'Básico', grados: '6° - 8°', pares: [
        { a: 'Colombia', b: 'Bogotá' }, { a: 'Francia', b: 'París' }, { a: 'Japón', b: 'Tokio' },
        { a: 'Brasil', b: 'Brasilia' }, { a: 'Egipto', b: 'El Cairo' }, { a: 'Italia', b: 'Roma' },
      ]},
      { nombre: 'Avanzado', grados: '9° - 11°', pares: [
        { a: 'Kazajistán', b: 'Astaná' }, { a: 'Australia', b: 'Canberra' }, { a: 'Turquía', b: 'Ankara' },
        { a: 'Canadá', b: 'Ottawa' }, { a: 'Sudáfrica', b: 'Pretoria' }, { a: 'Nueva Zelanda', b: 'Wellington' },
      ]},
    ],
  },
  {
    id: 'quimica', nombre: 'Química', icono: '🧪',
    niveles: [
      { nombre: 'Básico', grados: '6° - 8°', pares: [
        { a: 'Oxígeno', b: 'O' }, { a: 'Hidrógeno', b: 'H' }, { a: 'Carbono', b: 'C' },
        { a: 'Oro', b: 'Au' }, { a: 'Hierro', b: 'Fe' }, { a: 'Sodio', b: 'Na' },
      ]},
      { nombre: 'Avanzado', grados: '9° - 11°', pares: [
        { a: 'Agua', b: 'H₂O' }, { a: 'Sal común', b: 'NaCl' }, { a: 'Dióxido carbono', b: 'CO₂' },
        { a: 'Amoníaco', b: 'NH₃' }, { a: 'Ácido sulfúrico', b: 'H₂SO₄' }, { a: 'Glucosa', b: 'C₆H₁₂O₆' },
      ]},
    ],
  },
  {
    id: 'historia', nombre: 'Historia', icono: '🏛️',
    niveles: [
      { nombre: 'Básico', grados: '6° - 8°', pares: [
        { a: 'Independencia Colombia', b: '1810' }, { a: 'Llegada de Colón', b: '1492' },
        { a: 'Llegada a la Luna', b: '1969' }, { a: 'Descubrimiento América', b: '1492' },
        { a: 'Fin esclavitud Colombia', b: '1851' }, { a: 'Batalla de Boyacá', b: '1819' },
      ]},
      { nombre: 'Avanzado', grados: '9° - 11°', pares: [
        { a: 'Revolución Francesa', b: '1789' }, { a: 'Muro de Berlín cae', b: '1989' },
        { a: 'Segunda Guerra Mundial', b: '1939' }, { a: 'Revolución Rusa', b: '1917' },
        { a: 'Primera Guerra Mundial', b: '1914' }, { a: 'Independencia EE.UU.', b: '1776' },
      ]},
    ],
  },
  {
    id: 'lenguaje', nombre: 'Lenguaje', icono: '📖',
    niveles: [
      { nombre: 'Básico', grados: '6° - 8°', pares: [
        { a: 'Sustantivo', b: 'Nombra cosas' }, { a: 'Verbo', b: 'Indica acción' },
        { a: 'Adjetivo', b: 'Describe' }, { a: 'Sinónimo', b: 'Igual significado' },
        { a: 'Antónimo', b: 'Significado opuesto' }, { a: 'Sílaba', b: 'Sonido de palabra' },
      ]},
      { nombre: 'Avanzado', grados: '9° - 11°', pares: [
        { a: 'Cien años de soledad', b: 'García Márquez' }, { a: 'Don Quijote', b: 'Cervantes' },
        { a: 'La Metamorfosis', b: 'Kafka' }, { a: 'Hamlet', b: 'Shakespeare' },
        { a: 'La Odisea', b: 'Homero' }, { a: 'María', b: 'Jorge Isaacs' },
      ]},
    ],
  },
]

function crearCartas(pares) {
  const cartas = []
  pares.forEach((par, grupo) => {
    cartas.push({ id: grupo + '-a', grupo, texto: par.a, volteada: false, encontrada: false })
    cartas.push({ id: grupo + '-b', grupo, texto: par.b, volteada: false, encontrada: false })
  })
  return cartas.sort(() => Math.random() - 0.5)
}

function Memorama({ onVolver }) {
  const [materiaSel, setMateriaSel] = useState(null)
  const [categoria, setCategoria] = useState(null)
  const [cartas, setCartas] = useState([])
  const [seleccionadas, setSeleccionadas] = useState([])
  const [bloqueado, setBloqueado] = useState(false)
  const [intentos, setIntentos] = useState(0)

  const gano = cartas.length > 0 && cartas.every(c => c.encontrada)
  const totalPares = categoria ? categoria.pares.length : 0

  useEffect(() => {
    if (seleccionadas.length !== 2) return
    setBloqueado(true)
    setIntentos(prev => prev + 1)
    const [a, b] = seleccionadas

    if (a.grupo === b.grupo) {
      setCartas(prev => prev.map(c => c.grupo === a.grupo ? { ...c, encontrada: true } : c))
      setSeleccionadas([])
      setBloqueado(false)
    } else {
      const timer = setTimeout(() => {
        setCartas(prev => prev.map(c => (c.id === a.id || c.id === b.id) ? { ...c, volteada: false } : c))
        setSeleccionadas([])
        setBloqueado(false)
      }, 900)
      return () => clearTimeout(timer)
    }
  }, [seleccionadas])

  const elegirNivel = (nivel) => {
    setCategoria(nivel)
    setCartas(crearCartas(nivel.pares))
    setSeleccionadas([])
    setBloqueado(false)
    setIntentos(0)
  }

  const voltear = (carta) => {
    if (bloqueado || carta.volteada || carta.encontrada) return
    if (seleccionadas.length >= 2) return
    const nueva = { ...carta, volteada: true }
    setCartas(prev => prev.map(c => c.id === carta.id ? nueva : c))
    setSeleccionadas(prev => [...prev, nueva])
  }

  const reiniciar = () => {
    setCartas(crearCartas(categoria.pares))
    setSeleccionadas([])
    setBloqueado(false)
    setIntentos(0)
  }

  // ── Paso 1: elegir materia ──
  if (!materiaSel) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
        <h3 className="text-xl font-bold text-gray-800 mb-1 text-center">Elige una materia</h3>
        <p className="text-gray-400 text-sm text-center mb-6">Empareja conceptos con sus respuestas</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {MATERIAS_MEMO.map(mat => (
            <button key={mat.id} onClick={() => setMateriaSel(mat)}
              className="border-2 border-gray-200 rounded-2xl p-5 text-center hover:border-purple-300 hover:bg-purple-50 transition-all">
              <div className="text-4xl mb-2">{mat.icono}</div>
              <h4 className="font-bold text-gray-800 text-sm">{mat.nombre}</h4>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Paso 2: elegir nivel ──
  if (!categoria) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
        <button onClick={() => setMateriaSel(null)} className="text-sm font-semibold text-gray-400 hover:text-purple-600 mb-4">← Cambiar materia</button>
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{materiaSel.icono}</div>
          <h3 className="text-xl font-bold text-gray-800">{materiaSel.nombre}</h3>
          <p className="text-gray-400 text-sm">Elige tu nivel</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materiaSel.niveles.map((nivel, i) => (
            <button key={i} onClick={() => elegirNivel(nivel)}
              className="border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-purple-300 hover:bg-purple-50 transition-all">
              <div className="text-3xl mb-2">{i === 0 ? '🌱' : '🚀'}</div>
              <h4 className="font-bold text-gray-800">{nivel.nombre}</h4>
              <p className="text-gray-400 text-sm">{nivel.grados}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Tablero ──
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setCategoria(null)} className="text-sm font-semibold text-gray-400 hover:text-purple-600">← Cambiar nivel</button>
        <span className="text-xs font-semibold text-gray-400">{materiaSel.icono} {materiaSel.nombre} · {categoria.nombre}</span>
        <span className="text-sm font-bold text-purple-600">{cartas.filter(c => c.encontrada).length / 2} / {totalPares}</span>
      </div>

      {gano ? (
        <div className="text-center py-6">
          <span className="text-6xl">🏆</span>
          <h3 className="text-2xl font-black text-gray-800 mt-4">¡Encontraste todas!</h3>
          <p className="text-gray-500 mt-2">{materiaSel.nombre} {categoria.nombre} · {intentos} intentos</p>
          <div className="flex gap-3 mt-6">
            <button onClick={onVolver} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50">Salir</button>
            <button onClick={reiniciar} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md">Jugar de nuevo</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {cartas.map(carta => {
            const mostrada = carta.volteada || carta.encontrada
            return (
              <button key={carta.id} onClick={() => voltear(carta)} disabled={bloqueado}
                className={'aspect-square rounded-xl flex items-center justify-center text-center p-1 font-bold transition-all ' +
                  (mostrada
                    ? (carta.encontrada ? 'bg-green-100 border-2 border-green-300 text-green-700' : 'bg-purple-100 border-2 border-purple-300 text-purple-700')
                    : 'bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 shadow-md text-white')}>
                <span className={carta.texto.length > 6 ? 'text-[10px] leading-tight' : 'text-base'}>{mostrada ? carta.texto : '❓'}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── JUEGO: RAPIDFIRE ──────────────────────────────────
const TIEMPO_INICIAL = 30

const NIVELES_RF = [
  { id: 'basico', nombre: 'Básico', grados: '6° - 8°', icono: '🌱' },
  { id: 'avanzado', nombre: 'Avanzado', grados: '9° - 11°', icono: '🚀' },
]

function generarOperacion(nivel) {
  if (nivel === 'basico') {
    const ops = ['+', '−', '×']
    const op = ops[Math.floor(Math.random() * ops.length)]
    let a = Math.floor(Math.random() * 12) + 1
    let b = Math.floor(Math.random() * 12) + 1
    let resultado
    if (op === '+') resultado = a + b
    else if (op === '−') {
      if (b > a) [a, b] = [b, a]
      resultado = a - b
    } else resultado = a * b
    return { texto: a + ' ' + op + ' ' + b, resultado }
  } else {
    // Avanzado: potencias, raíces, combinadas, números mayores
    const tipos = ['potencia', 'raiz', 'combinada', 'mult_grande']
    const tipo = tipos[Math.floor(Math.random() * tipos.length)]
    if (tipo === 'potencia') {
      const base = Math.floor(Math.random() * 8) + 2  // 2-9
      return { texto: base + '²', resultado: base * base }
    } else if (tipo === 'raiz') {
      const raiz = Math.floor(Math.random() * 10) + 2  // 2-11
      return { texto: '√' + (raiz * raiz), resultado: raiz }
    } else if (tipo === 'combinada') {
      const a = Math.floor(Math.random() * 9) + 2
      const b = Math.floor(Math.random() * 9) + 2
      const c = Math.floor(Math.random() * 9) + 1
      return { texto: a + ' × ' + b + ' + ' + c, resultado: a * b + c }
    } else {
      const a = Math.floor(Math.random() * 16) + 10  // 10-25
      const b = Math.floor(Math.random() * 8) + 3    // 3-10
      return { texto: a + ' × ' + b, resultado: a * b }
    }
  }
}

function Rapidfire({ onVolver }) {
  const [nivel, setNivel] = useState(null)
  const [operacion, setOperacion] = useState(null)
  const [respuesta, setRespuesta] = useState('')
  const [puntos, setPuntos] = useState(0)
  const [tiempo, setTiempo] = useState(TIEMPO_INICIAL)
  const [jugando, setJugando] = useState(false)
  const [racha, setRacha] = useState(0)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    if (!jugando) return
    const intervalo = setInterval(() => {
      setTiempo(t => t - 1)
    }, 1000)
    return () => clearInterval(intervalo)
  }, [jugando])

  useEffect(() => {
    if (tiempo <= 0 && jugando) setJugando(false)
  }, [tiempo, jugando])

  const empezar = () => {
    setPuntos(0)
    setTiempo(TIEMPO_INICIAL)
    setRacha(0)
    setRespuesta('')
    setOperacion(generarOperacion(nivel.id))
    setJugando(true)
  }

  const verificar = (valor) => {
    if (parseInt(valor) === operacion.resultado) {
      setPuntos(p => p + 1)
      setRacha(r => r + 1)
      setFeedback('ok')
      setOperacion(generarOperacion(nivel.id))
      setRespuesta('')
      setTimeout(() => setFeedback(null), 300)
    }
  }

  const onChange = (e) => {
    const valor = e.target.value
    setRespuesta(valor)
    if (valor !== '') verificar(valor)
  }

  // ── Paso 1: elegir nivel ──
  if (!nivel) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-lg mx-auto">
        <div className="text-center mb-6">
          <span className="text-5xl">⚡</span>
          <h3 className="text-xl font-bold text-gray-800 mt-3">Rapidfire Matemático</h3>
          <p className="text-gray-400 text-sm">Elige tu nivel</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {NIVELES_RF.map(n => (
            <button key={n.id} onClick={() => setNivel(n)}
              className="border-2 border-gray-200 rounded-2xl p-6 text-center hover:border-purple-300 hover:bg-purple-50 transition-all">
              <div className="text-3xl mb-2">{n.icono}</div>
              <h4 className="font-bold text-gray-800">{n.nombre}</h4>
              <p className="text-gray-400 text-sm">{n.grados}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Pantalla inicial del nivel ──
  if (!jugando && tiempo === TIEMPO_INICIAL && puntos === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-lg mx-auto">
        <button onClick={() => setNivel(null)} className="text-sm font-semibold text-gray-400 hover:text-purple-600 float-left">← Cambiar nivel</button>
        <span className="text-6xl">{nivel.icono}</span>
        <h3 className="text-2xl font-black text-gray-800 mt-4">Nivel {nivel.nombre}</h3>
        <p className="text-gray-500 mt-2 mb-6">Resuelve cuantas operaciones puedas en {TIEMPO_INICIAL} segundos. ¡Solo escribe el resultado!</p>
        <div className="flex gap-3">
          <button onClick={onVolver} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50">Salir</button>
          <button onClick={empezar} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md">¡Empezar!</button>
        </div>
      </div>
    )
  }

  // ── Pantalla de resultado ──
  if (!jugando) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm max-w-lg mx-auto">
        <span className="text-6xl">{puntos >= 20 ? '🏆' : puntos >= 10 ? '🔥' : '💪'}</span>
        <h3 className="text-2xl font-black text-gray-800 mt-4">¡Se acabó el tiempo!</h3>
        <p className="text-gray-500 mt-2">Nivel {nivel.nombre} · Resolviste</p>
        <p className="text-6xl font-black text-purple-600 my-3">{puntos}</p>
        <p className="text-gray-400 text-sm">operaciones correctas</p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => { setNivel(null); setTiempo(TIEMPO_INICIAL); setPuntos(0) }} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50">Cambiar nivel</button>
          <button onClick={empezar} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 shadow-md">Jugar de nuevo</button>
        </div>
      </div>
    )
  }

  // ── Juego activo ──
  const pctTiempo = (tiempo / TIEMPO_INICIAL) * 100
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-purple-600">⭐ {puntos}</span>
        {racha >= 3 && <span className="text-sm font-bold text-orange-500">🔥 Racha {racha}</span>}
        <span className={'text-sm font-bold ' + (tiempo <= 10 ? 'text-red-500' : 'text-gray-500')}>⏱️ {tiempo}s</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div className={'h-2 rounded-full transition-all ' + (tiempo <= 10 ? 'bg-red-500' : 'bg-purple-600')} style={{ width: pctTiempo + '%' }} />
      </div>

      <div className={'text-center py-8 rounded-2xl mb-6 transition-all ' + (feedback === 'ok' ? 'bg-green-50' : 'bg-slate-50')}>
        <p className="text-5xl font-black text-gray-800">{operacion?.texto}</p>
      </div>

      <input
        type="number"
        value={respuesta}
        onChange={onChange}
        autoFocus
        placeholder="?"
        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-5 text-center text-3xl font-black focus:outline-none focus:border-purple-400 transition-all"
      />
      <p className="text-center text-gray-400 text-xs mt-3">Escribe el resultado, avanza solo al acertar</p>
    </div>
  )
}

// ─── PANTALLA PRINCIPAL ────────────────────────────────
const JUEGOS = [
  { id: 'trivia', titulo: 'Trivia', desc: 'Pon a prueba tus conocimientos', icono: '🧠', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  { id: 'ahorcado', titulo: 'Ahorcado', desc: 'Adivina la palabra antes de que sea tarde', icono: '🔤', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  { id: 'memorama', titulo: 'Memorama', desc: 'Encuentra las parejas de cartas', icono: '🃏', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  { id: 'rapidfire', titulo: 'Rapidfire', desc: 'Resuelve operaciones matemáticas rápidamente', icono: '⚡', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
]

export default function Juegos() {
  const [juegoActivo, setJuegoActivo] = useState(null)

  return (
    <Layout rol="ESTUDIANTE" navItems={NAV}>
      <div className="max-w-6xl mx-auto px-5 py-6 space-y-6">

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-black text-gray-900">Juegos Educativos </h2>
            <p className="text-gray-400 text-sm mt-0.5">Aprende jugando</p>
          </div>
          {juegoActivo && (
            <button onClick={() => setJuegoActivo(null)}
              className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700 transition-all shadow-sm">
              ← Volver a juegos
            </button>
          )}
        </div>

        {juegoActivo === 'trivia' && <Trivia onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'ahorcado' && <Ahorcado onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'memorama' && <Memorama onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'rapidfire' && <Rapidfire onVolver={() => setJuegoActivo(null)} />}
        {!juegoActivo && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {JUEGOS.map(j => (
              <button key={j.id} onClick={() => setJuegoActivo(j.id)}
                className={j.bg + ' border-2 ' + j.border + ' rounded-2xl p-7 text-left hover:scale-[1.02] hover:shadow-lg transition-all shadow-sm'}>
                <div className="text-5xl mb-3">{j.icono}</div>
                <h3 className={'text-xl font-bold ' + j.text + ' mb-1'}>{j.titulo}</h3>
                <p className="text-gray-500 text-sm">{j.desc}</p>
                <div className={'mt-4 inline-flex items-center gap-2 ' + j.text + ' text-sm font-semibold'}>
                  <span>Jugar</span><span>→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}