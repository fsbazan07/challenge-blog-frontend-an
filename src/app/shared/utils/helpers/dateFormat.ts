export const formatAR = (d: string | Date) =>
  new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(typeof d === 'string' ? new Date(d) : d);
