# 🎓 EduSmart AI+

Plataforma educativa full-stack que conecta profesores y estudiantes en un entorno de aprendizaje interactivo, con gestión académica, evaluaciones, foros, juegos educativos y asistente de IA.

---

## 📋 Descripción

EduSmart AI+ es una aplicación web que permite a los profesores gestionar periodos académicos, grados, materias y actividades, mientras los estudiantes se inscriben con claves de matrícula, entregan tareas, participan en foros y refuerzan su aprendizaje con juegos educativos. Incluye un panel administrativo, sistema de membresías para profesores y analíticas en tiempo real.

---

## ✨ Funcionalidades principales

### 👨‍🏫 Profesor
- Gestión completa de estructura académica (periodos, grados, materias)
- Creación de actividades con contenidos (documentos, videos, enlaces, instrucciones)
- Claves de matrícula para que los estudiantes se inscriban
- Foros de discusión (incluyendo actividades de "solo foro")
- Calificación de entregas y planilla de notas
- Analíticas con gráficas en tiempo real
- Sistema de membresía con pago, periodo de gracia y renovación

### 👨‍🎓 Estudiante
- Inscripción a materias mediante clave
- Entrega de tareas con texto y archivos adjuntos
- Visualización de calificaciones y progreso
- Participación en foros
- 4 juegos educativos (Trivia, Ahorcado, Memorama, Rapidfire) con niveles por materia
- Notificaciones automáticas de tareas y calificaciones
- Búsqueda global

### 🛡️ Administrador
- Gestión de usuarios (profesores y estudiantes)
- Control de membresías y pagos
- Estadísticas globales de la plataforma

---

## 🛠️ Tecnologías

### Frontend
- **React 18** + **Vite**
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **Recharts** para gráficas
- **Axios** para peticiones HTTP

### Backend
- **Node.js** + **Express**
- **Prisma ORM**
- **PostgreSQL** (Supabase)
- **JWT** para autenticación
- **bcrypt** para encriptación de contraseñas

### Servicios
- **Supabase** — Base de datos PostgreSQL y almacenamiento de archivos
- **Groq** — Asistente de IA

---

## 🚀 Instalación local

### Requisitos previos
- Node.js 18 o superior
- Una cuenta de Supabase (base de datos y storage)

### 1. Clonar el repositorio
    git clone https://github.com/Jaranda5429/edusmart-ai.git
    cd edusmart-ai

### 2. Configurar el backend
    cd backend
    npm install

Crea un archivo `.env` en la carpeta `backend/` con:

    DATABASE_URL="tu_url_de_supabase_pooler"
    DIRECT_URL="tu_url_de_supabase_directa"
    JWT_SECRET="tu_clave_secreta"
    PORT=3000
    GROQ_API_KEY="tu_api_key_de_groq"

Sincroniza la base de datos:

    npx prisma db push

Inicia el servidor:

    npm run dev

### 3. Configurar el frontend
    cd frontend
    npm install

Crea un archivo `.env` en la carpeta `frontend/` con:

    VITE_API_URL="http://localhost:3000/api"

Inicia la aplicación:

    npm run dev

La app estará disponible en `http://localhost:5173`

---

## 📁 Estructura del proyecto

    edusmart-ai/
    ├── backend/
    │   ├── prisma/
    │   │   └── schema.prisma      # Modelos de la base de datos
    │   └── src/
    │       ├── controllers/       # Lógica de negocio
    │       ├── routes/            # Definición de rutas
    │       ├── middlewares/       # Autenticación y permisos
    │       └── index.js           # Punto de entrada
    │
    └── frontend/
        └── src/
            ├── pages/             # Vistas (auth, student, teacher, admin)
            ├── components/        # Componentes reutilizables
            ├── context/           # Estado global (Auth, Profesor, Admin)
            └── services/          # Conexión con API y Supabase

---

## 👤 Roles de usuario

| Rol | Acceso |
|-----|--------|
| **Administrador** | Gestión total de la plataforma |
| **Profesor** | Requiere membresía activa. Gestiona sus cursos |
| **Estudiante** | Gratuito. Se inscribe con claves de matrícula |

---

## 📝 Licencia

Proyecto académico desarrollado como trabajo de formación.

---

## 👨‍💻 Autor

Desarrollado por Juan Aranda y Sara Forero — Proyecto formativo SENA.