/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Marca Appgom
        brand: {
          orange: '#FF5516',
          navy: '#13244B',
          blue: '#455884',
          purple: '#592B47',
        },

        // Acento principal (naranja) — se mantiene el nombre "action-blue"
        // por compatibilidad con el resto del codigo, solo cambia el valor.
        'primary-container': '#FF5516',
        'action-blue': '#FF5516',
        primary: '#E64510',
        'on-primary': '#ffffff',
        'on-primary-container': '#FFE9E0',
        'primary-fixed': '#FFDBCB',
        'primary-fixed-dim': '#FFB496',
        'on-primary-fixed': '#4A1400',
        'on-primary-fixed-variant': '#B23A0F',
        'inverse-primary': '#FF7A45',
        'surface-tint': '#FF5516',

        // Secundario (azul claro de marca) — texto atenuado y detalles
        secondary: '#9BAAD0',
        'on-secondary': '#0B1526',
        'secondary-container': '#243759',
        'on-secondary-container': '#C7D0E8',
        'secondary-fixed': '#D3DCF2',
        'secondary-fixed-dim': '#9BAAD0',
        'on-secondary-fixed': '#101E3D',
        'on-secondary-fixed-variant': '#455884',

        // Terciario (morado de marca) — acentos especiales, login, gradientes
        tertiary: '#B8547E',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#592B47',
        'on-tertiary-container': '#F5D9E7',
        'tertiary-fixed': '#F0C7DB',
        'tertiary-fixed-dim': '#D98CB2',
        'on-tertiary-fixed': '#3A1A2C',
        'on-tertiary-fixed-variant': '#7A3D5F',

        // Estados semanticos (legibles sobre fondo oscuro)
        'status-success': '#22C55E',
        'status-warning': '#F5A524',
        'status-error': '#FF6B6B',
        error: '#FF6B6B',
        'error-container': '#4A1F22',
        'on-error': '#ffffff',
        'on-error-container': '#FFD9D9',

        // Superficies — familia de azul fuerte de marca
        background: '#0B1526',
        surface: '#0B1526',
        'surface-base': '#0B1526',
        'surface-dim': '#060B16',
        'surface-bright': '#1C3159',
        'surface-card': '#101E3D',
        'surface-container-lowest': '#101E3D',
        'surface-container-low': '#16294F',
        'surface-container': '#1C3159',
        'surface-container-high': '#24406F',
        'surface-container-highest': '#2E4E86',
        'surface-variant': '#24406F',
        'on-background': '#F3F5FA',
        'on-surface': '#F3F5FA',
        'text-main': '#F3F5FA',
        'on-surface-variant': '#C7D0E8',
        'text-muted': '#93A3C9',
        'inverse-surface': '#F3F5FA',
        'inverse-on-surface': '#101E3D',

        // Bordes y contornos
        'border-subtle': '#263A63',
        outline: '#6C7DA6',
        'outline-variant': '#3A4C77',
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
      spacing: {
        'stack-md': '16px',
        'stack-lg': '24px',
        'stack-sm': '8px',
        'sidebar-width': '240px',
        gutter: '24px',
        'container-max': '1280px',
      },
      fontFamily: {
        'mono-label': ['JetBrains Mono'],
        'body-md': ['Inter'],
        'label-md': ['Inter'],
        'display-sm': ['Inter'],
        'body-sm': ['Inter'],
        'title-lg': ['Inter'],
        'headline-md': ['Inter'],
      },
      fontSize: {
        'mono-label': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        'display-sm': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'title-lg': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
};
