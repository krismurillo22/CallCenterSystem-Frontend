// src/components/ui/Input.jsx
import React from 'react';

// Pasamos props comunes: label (etiqueta), type (text, password, etc), y el resto (...props)
export default function Input({ label, type = 'text', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '15px', gap: '5px' }}>
      {label && <label style={{ fontWeight: 'bold', fontSize: '14px' }}>{label}</label>}
      
      <input
        type={type}
        style={{
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '16px'
        }}
        {...props}
      />
    </div>
  );
}