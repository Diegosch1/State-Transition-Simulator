export class Page {
  constructor(pid, data) {
    this.pid = pid;        // Proceso al que pertenece la página
    this.data = data;      // Contenido simulado
    this.lastUsed = Date.now(); // Para LRU
  }
}