# DUERME.COOL - Template para EasyPanel BoltDIY

## Instrucciones para crear el template:

### 1. Crea una carpeta nueva en tu computadora llamada `duerme-cool`

### 2. Copia estos archivos con el contenido exacto:

---

## package.json
```json
{
  "name": "duerme-cool",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.1",
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.18",
    "eslint": "^9.9.1",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.11",
    "globals": "^15.9.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.3.0",
    "vite": "^5.4.2"
  }
}
```

---

## vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

---

## tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

## index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Duerme.cool - Descanso Perfecto con Temperatura Ideal</title>
    <meta name="description" content="Disfruta de noches placenteras con nuestro cover que ajusta automáticamente la temperatura de tu cama, garantizando un sueño profundo y reparador." />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## .env.example
```
# Variables de entorno para duerme.cool
VITE_SITE_URL=https://duerme.cool
```

---

## README.md
```markdown
# Duerme.cool - Sistema de Regulación Térmica para Camas

Landing page para producto innovador de regulación de temperatura en camas.

## 🚀 Desarrollo

```bash
npm install
npm run dev
```

## 🏗️ Build para producción

```bash
npm run build
```

## 📁 Estructura

- `src/components/` - Componentes React
- `src/App.tsx` - Componente principal
- `dist/` - Archivos de producción

## 🚀 Deploy en EasyPanel

1. Sube este template a EasyPanel
2. EasyPanel detectará automáticamente Vite
3. Build command: `npm run build`
4. Output directory: `dist`
```

---

### 3. Crea la carpeta `src/` y dentro copia estos archivos:

## src/main.tsx
```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

## src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## src/App.tsx
```typescript
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Benefits from './components/Benefits';
import FAQ from './components/FAQ';
import Validation from './components/Validation';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <HowItWorks />
      <Benefits />
      <Validation />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

export default App;
```

### 4. Crea la carpeta `src/components/` y copia todos los componentes

**NOTA**: Los archivos de componentes son muy largos. ¿Prefieres que:

**A)** Te los muestre uno por uno aquí
**B)** Cree un método para descargar cada componente individualmente
**C)** Te dé las instrucciones para copiarlos directamente desde el explorador de archivos de Bolt

¿Cuál opción prefieres?