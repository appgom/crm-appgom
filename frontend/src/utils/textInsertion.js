// Inserta texto en la posición del cursor de un <input>/<textarea>, o
// reemplaza la selección si había una. Usado para insertar variables
// {{...}} y para envolver texto seleccionado (negrita/cursiva de WhatsApp)
// sin que el usuario tenga que escribir la sintaxis a mano.
export function insertAtCursor(el, texto, setValue) {
  if (!el) return;
  const inicio = el.selectionStart ?? el.value.length;
  const fin = el.selectionEnd ?? el.value.length;
  const nuevo = el.value.slice(0, inicio) + texto + el.value.slice(fin);
  setValue(nuevo);
  requestAnimationFrame(() => {
    el.focus();
    el.selectionStart = el.selectionEnd = inicio + texto.length;
  });
}

export function envolverSeleccion(el, antes, despues, setValue) {
  if (!el) return;
  const inicio = el.selectionStart ?? el.value.length;
  const fin = el.selectionEnd ?? el.value.length;
  const seleccionado = el.value.slice(inicio, fin) || 'texto';
  const nuevo = el.value.slice(0, inicio) + antes + seleccionado + despues + el.value.slice(fin);
  setValue(nuevo);
  requestAnimationFrame(() => {
    el.focus();
    el.selectionStart = inicio + antes.length;
    el.selectionEnd = inicio + antes.length + seleccionado.length;
  });
}
