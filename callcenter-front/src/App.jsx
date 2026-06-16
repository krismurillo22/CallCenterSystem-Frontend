import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Title from './components/Title'

import Button from "./components/Button";

function App() {
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Abrir Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Detalles de Llamada"
      >
        <p><strong>Agente:</strong> Juan Pérez</p>
        <p><strong>Estado:</strong> En llamada</p>
        <p><strong>Duración:</strong> 00:03:45</p>
        <p><strong>Cliente:</strong> María López</p>
        <button onClick={() => setIsOpen(false)}>Cerrar</button>
      </Modal>
    </div>
  )
}

export default App
