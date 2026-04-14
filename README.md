# Duerme.cool - Sistema de Regulación Térmica para Camas

Una landing page moderna para un producto innovador de regulación de temperatura en camas.

## 🚀 Características

- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Vite** como bundler
- **Lucide React** para iconos
- **Responsive Design** optimizado para móviles
- **Componentes modulares** bien organizados

## 📦 Instalación

```bash
npm install
npm run dev
```

## 🏗️ Build para producción

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## 📁 Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── Header.tsx      # Navegación principal
│   ├── Hero.tsx        # Sección hero
│   ├── HowItWorks.tsx  # Cómo funciona
│   ├── Benefits.tsx    # Beneficios
│   ├── Validation.tsx  # Validación social
│   ├── FAQ.tsx         # Preguntas frecuentes
│   ├── CTA.tsx         # Call to action
│   └── Footer.tsx      # Pie de página
├── App.tsx             # Componente principal
├── main.tsx           # Punto de entrada
└── index.css          # Estilos globales
```

## 🎨 Personalización

### Cambiar colores
Edita las clases de Tailwind en los componentes o extiende el tema en `tailwind.config.js`

### Agregar enlaces
Modifica los componentes correspondientes, por ejemplo en `Hero.tsx` para el botón "Ver Cómo Funciona"

### Contenido
Todo el contenido está en español y es fácilmente editable en cada componente

## 🚀 Deployment

### Netlify
```bash
npm run build
# Sube la carpeta dist/
```

### VPS/EasyPanel
```bash
npm run build
# Sube el contenido de dist/ a tu servidor web
```

## 📱 Responsive

El sitio está optimizado para:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🛠️ Tecnologías

- React 18.3.1
- TypeScript 5.5.3
- Vite 5.4.2
- Tailwind CSS 3.4.1
- Lucide React 0.344.0