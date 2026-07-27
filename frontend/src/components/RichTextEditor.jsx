import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Editor visual simple para el cuerpo de las plantillas de correo: el admin
// nunca escribe ni ve etiquetas HTML, solo texto con negrita/cursiva como en
// un procesador de texto. Se guarda como HTML por dentro para que el correo
// se vea igual que hoy, pero la edición es 100% visual.
const RichTextEditor = forwardRef(function RichTextEditor({ initialValue, onChange, onFocus }, ref) {
  const editorRef = useRef(null);
  const savedRange = useRef(null);

  // Solo al montar: la actualización posterior del HTML la maneja el propio
  // contentEditable, no React (si volviéramos a inyectar el value en cada
  // render se perdería la posición del cursor al escribir).
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = initialValue || '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleInput() {
    onChange(editorRef.current.innerHTML);
  }

  function guardarSeleccion() {
    const sel = window.getSelection();
    if (sel.rangeCount && editorRef.current.contains(sel.anchorNode)) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function exec(comando) {
    editorRef.current.focus();
    document.execCommand(comando);
    handleInput();
  }

  useImperativeHandle(ref, () => ({
    insertarVariable(texto) {
      editorRef.current.focus();
      const sel = window.getSelection();
      sel.removeAllRanges();
      if (savedRange.current) sel.addRange(savedRange.current);
      document.execCommand('insertText', false, texto);
      guardarSeleccion();
      handleInput();
    },
  }));

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-container-low">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border-subtle bg-surface-base">
        <button
          type="button"
          title="Negrita"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('bold')}
          className="w-7 h-7 rounded hover:bg-surface-container-low text-sm font-bold text-secondary hover:text-on-surface"
        >
          B
        </button>
        <button
          type="button"
          title="Cursiva"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('italic')}
          className="w-7 h-7 rounded hover:bg-surface-container-low text-sm italic text-secondary hover:text-on-surface"
        >
          I
        </button>
        <button
          type="button"
          title="Subrayado"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => exec('underline')}
          className="w-7 h-7 rounded hover:bg-surface-container-low text-sm underline text-secondary hover:text-on-surface"
        >
          U
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={onFocus}
        onKeyUp={guardarSeleccion}
        onMouseUp={guardarSeleccion}
        onBlur={guardarSeleccion}
        className="px-3 py-2.5 text-sm min-h-[110px] outline-none text-on-surface [&_p]:mb-2"
      />
    </div>
  );
});

export default RichTextEditor;
