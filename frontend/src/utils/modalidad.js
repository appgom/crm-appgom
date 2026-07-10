const ETIQUETAS = {
  recurrente: 'Recurrente',
  bolsa_horas: 'Bolsa de horas',
  por_ticket: 'Por ticket',
  proyecto_unico: 'Proyecto único',
};

export function etiquetaModalidad(modalidad) {
  return ETIQUETAS[modalidad] || modalidad;
}
