// Los 50 niveles de Escalada Épica: 5 etapas × 10. 'legacy' = nivel hecho a mano (índice en el levels.js del volcán);
// 'gen' = nivel compuesto por tramos verificados (tools/gen2.js). diff: 1-10 dentro de la etapa.
// Solo los niveles 1-10 (etapa 1) llevan letreros de tutorial.
module.exports = [
  // ---------- ETAPA 1 · EL BOSQUE DE LA MONTAÑA (tutorial) ----------
  { name: 'Sendero del Bosque', sub: 'El viaje comienza', theme: 'pradera', legacy: 0, hints: [
    'Muévete con {LR} y salta con {JUMP}. Mantén {JUMP} para saltar más alto.',
    'Salta hacia la roca con presas y mantén la dirección (o {UP}) para agarrarte sola. Trepa con {UD}.',
    'Toca los anclajes rúnicos: tu cuerda élfica se ata a ellos y, si caes, te devuelve al último.',
    'Trepar cansa (la barra sobre tu cabeza). Descansa de pie para recuperar el vigor.'] },
  { name: 'Ruinas del Bosque', sub: 'Muros de los antiguos', theme: 'ruinas', legacy: 1, hints: [
    'Los muros de piedra son lisos: no se agarran. Junto a un muro, {DIAG} salta en diagonal y rebota al otro lado.',
    'Liana: {UP} para subir. No cansa, ¡te devuelve el vigor!',
    'La poción de vigor te recarga en plena pared. Tómala al pasar.'] },
  { name: 'Riscos de Musgo', sub: 'La roca cruje', theme: 'bosque', legacy: 2, hints: [
    'Roca agrietada: se derrumba poco después de pisarla o agarrarla. ¡No te detengas!',
    'Caen piñas y piedras: el polvo avisa dónde caerá la próxima. Cruza entre una y otra.',
    'Un goblin arquero vigila la pared: trepa entre flecha y flecha. Salta sobre él para derrotarlo.'] },
  { name: 'Ramas Altas', sub: 'Entre las copas', theme: 'bosque', gen: 'F', diff: 1, chunks: 4, seed: 101, hints: [
    'Las ramas se atraviesan desde abajo: salta a través de ellas y aterriza encima.',
    'Murciélagos: tocarlos duele, pero puedes caerles encima para derrotarlos.'] },
  { name: 'Troncos Viejos', sub: 'Rebota y sube', theme: 'bosque', gen: 'F', diff: 2, chunks: 4, seed: 102, hints: [
    'Agarrada a una pared, {DIAG} salta hacia el otro lado. Úsalo para subir en zigzag entre dos muros.',
    'Un salto hacia arriba desde la pared ({JUMPU}) gasta vigor, pero te deja agarrarte más alto.'] },
  { name: 'Hondonada de Lianas', sub: 'El bosque cuelga', theme: 'bosque', gen: 'F', diff: 3, chunks: 4, seed: 103, hints: [
    'Las lianas devuelven el vigor: descansa colgada antes de una pared larga.',
    'Desde una liana, {DIAG} salta hacia un costado.'] },
  { name: 'Nido de Ardillas', sub: 'Planean en picada', theme: 'bosque', gen: 'F', diff: 4, chunks: 5, seed: 104, hints: [
    'Las ardillas voladoras se lanzan en picada cuando pasas debajo. Espera a que vuelvan a subir.'] },
  { name: 'Espinos', sub: 'El bosque se pudre', theme: 'corrupto', gen: 'F', diff: 5, chunks: 5, seed: 105, hints: [
    'Las espinas matan al tocarlas. Mira bien antes de saltar: no hay prisa.'] },
  { name: 'Bosque Maldito', sub: 'Raíces negras', theme: 'corrupto', gen: 'F', diff: 6, chunks: 5, seed: 106, hints: [
    'Los simios lanzan piñas en arco: mira dónde caerán y pasa entre un tiro y otro.'] },
  { name: 'El Árbol Antiguo', sub: 'El Spriggan corrupto', theme: 'claro', boss: 'ent', gen: 'F', diff: 5, chunks: 3, seed: 110, arena: 1, hints: [
    '¡El Spriggan corrupto despertó! Trepa hasta las 3 runas de luz y tócalas para purificarlo.'] },

  // ---------- ETAPA 2 · LAS CUMBRES NEVADAS ----------
  { name: 'Ladera Nevada', sub: 'Empieza la nieve', theme: 'nieve', gen: 'N', diff: 2, chunks: 5, seed: 201 },
  { name: 'El Glaciar', sub: 'Hielo azul', theme: 'glaciar', legacy: 5 },
  { name: 'Cornisas de Hielo', sub: 'No resbales', theme: 'nieve', gen: 'N', diff: 3, chunks: 5, seed: 203 },
  { name: 'Paso de los Simios', sub: 'Bolas de nieve', theme: 'nieve', gen: 'N', diff: 4, chunks: 5, seed: 204 },
  { name: 'Ventisca', sub: 'El viento aúlla', theme: 'ventisca', gen: 'N', diff: 4, chunks: 5, seed: 205, wind: 360 },
  { name: 'Grieta Azul', sub: 'Dentro del hielo', theme: 'glaciar', gen: 'N', diff: 5, chunks: 6, seed: 206 },
  { name: 'Arista del Viento', sub: 'Filo de la montaña', theme: 'ventisca', legacy: 8, wind: 430 },
  { name: 'Carámbanos', sub: 'Lanzas de hielo', theme: 'glaciar', gen: 'N', diff: 6, chunks: 6, seed: 208 },
  { name: 'Tormenta Blanca', sub: 'Antes de la cumbre', theme: 'ventisca', gen: 'N', diff: 7, chunks: 6, seed: 209, wind: 420 },
  { name: 'La Cumbre Helada', sub: 'La Bestia de las Nieves', theme: 'cumbre', boss: 'yeti', gen: 'N', diff: 6, chunks: 3, seed: 210, arena: 1 },

  // ---------- ETAPA 3 · EL VOLCÁN ----------
  { name: 'Deshielo', sub: 'La nieve se derrite', theme: 'faldas', gen: 'V', diff: 3, chunks: 5, seed: 301 },
  { name: 'Ríos de Magma', sub: 'Donde arde la tierra', theme: 'magma', legacy: 3 },
  { name: 'Riscos Ardientes', sub: 'La roca quema', theme: 'riscos', gen: 'V', diff: 4, chunks: 6, seed: 303 },
  { name: '¡La Lava Sube!', sub: 'Huye del magma', theme: 'magma', legacy: 4 },
  { name: 'Cueva de Obsidiana', sub: 'Cristal negro', theme: 'cueva', gen: 'V', diff: 5, chunks: 6, seed: 305 },
  { name: 'Nido de Diablillos', sub: 'Alas de fuego', theme: 'nido', legacy: 6 },
  { name: 'Fumarolas', sub: 'La montaña respira', theme: 'magma', gen: 'V', diff: 6, chunks: 6, seed: 307 },
  { name: 'Chimenea Ígnea', sub: 'El corazón del volcán', theme: 'chimenea', legacy: 7 },
  { name: 'Ventisca de Ceniza', sub: 'Antes del cráter', theme: 'ceniza', gen: 'V', diff: 7, chunks: 6, seed: 309, wind: 430 },
  { name: 'El Cráter', sub: 'El Gólem de Lava', theme: 'crater', boss: 'golem', legacy: 9 },

  // ---------- ETAPA 4 · LA TORRE FANTASMA ----------
  { name: 'Puertas de la Torre', sub: 'Algo se mueve dentro', theme: 'torre', gen: 'T', diff: 3, chunks: 6, seed: 401 },
  { name: 'Salón de Armaduras', sub: 'Arqueros sin carne', theme: 'torre', gen: 'T', diff: 4, chunks: 6, seed: 402 },
  { name: 'La Biblioteca', sub: 'Susurros entre libros', theme: 'torre', gen: 'T', diff: 5, chunks: 6, seed: 403 },
  { name: 'Mazmorras', sub: 'Púas en el suelo', theme: 'cripta', gen: 'T', diff: 5, chunks: 6, seed: 404 },
  { name: 'Escalera de Caracol', sub: 'Sube sin mirar abajo', theme: 'torre', gen: 'T', diff: 6, chunks: 7, seed: 405 },
  { name: 'Almenas', sub: 'Bajo la luna', theme: 'almenas', gen: 'T', diff: 6, chunks: 7, seed: 406, wind: 300 },
  { name: 'La Cripta', sub: 'Los muertos no duermen', theme: 'cripta', gen: 'T', diff: 7, chunks: 7, seed: 407 },
  { name: 'Salón de Sierras', sub: 'Hojas que giran', theme: 'torre', gen: 'T', diff: 8, chunks: 7, seed: 408 },
  { name: 'El Campanario', sub: 'Doblan las campanas', theme: 'almenas', gen: 'T', diff: 8, chunks: 7, seed: 409 },
  { name: 'La Cima de la Torre', sub: 'El Fantasma de la Torre', theme: 'campanario', boss: 'espectro', gen: 'T', diff: 7, chunks: 3, seed: 410, arena: 1 },

  // ---------- ETAPA 5 · EL ASCENSO ESPIRITUAL (de la noche a la luz) ----------
  { name: 'Escalera de Estrellas', sub: 'Más allá de la torre', theme: 'astral0', gen: 'E', diff: 3, chunks: 6, seed: 501 },
  { name: 'Puente de Luz', sub: 'Plataformas que parpadean', theme: 'astral1', gen: 'E', diff: 4, chunks: 6, seed: 502 },
  { name: 'Nubes de Plata', sub: 'El cielo se abre', theme: 'astral2', gen: 'E', diff: 5, chunks: 7, seed: 503 },
  { name: 'Jardín de Almas', sub: 'Luces perdidas', theme: 'astral3', gen: 'E', diff: 5, chunks: 7, seed: 504 },
  { name: 'Cristales Flotantes', sub: 'Reflejos del alba', theme: 'astral4', gen: 'E', diff: 6, chunks: 7, seed: 505 },
  { name: 'Río de Luz', sub: 'Corriente de almas', theme: 'astral5', gen: 'E', diff: 7, chunks: 7, seed: 506 },
  { name: 'Templo del Alba', sub: 'Columnas de luz', theme: 'astral6', gen: 'E', diff: 7, chunks: 8, seed: 507 },
  { name: 'Cielo Dorado', sub: 'Casi en la cima', theme: 'astral7', gen: 'E', diff: 8, chunks: 8, seed: 508 },
  { name: 'Puertas del Plano', sub: 'La luz eterna', theme: 'astral8', gen: 'E', diff: 9, chunks: 8, seed: 509 },
  { name: 'La Prisión de Almas', sub: 'El Carcelero de Almas', theme: 'astral9', boss: 'carcelero', gen: 'E', diff: 8, chunks: 4, seed: 510, arena: 1 }
];
