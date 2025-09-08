import { Process } from '../core/processModel';

export class ProcessManager {
  constructor() {
    this.processes = new Map();
  }

  /**
   * Crea y añade un nuevo proceso a la colección.
   * @returns {Process} El nuevo objeto de proceso.
   */
  createProcess(controller = null) {
    const newProcess = new Process("High", controller);
    this.processes.set(newProcess.pid, newProcess);
    return newProcess;
  }

  /**
   * Obtiene un proceso específico por su PID.
   * @param {string} pid El PID del proceso a buscar.
   * @returns {Process | undefined} El objeto de proceso o undefined si no se encuentra.
   */
  getProcess(pid) {
    return this.processes.get(pid);
  }

  /**
   * Obtiene todos los procesos en la colección.
   * @returns {Array<Process>} Un array de todos los objetos de proceso.
   */
  getAllProcesses() {
    return Array.from(this.processes.values());
  }

  /**
   * Remueve un proceso de la colección (útil para procesos terminados).
   * @param {string} pid El PID del proceso a remover.
   * @returns {boolean} Verdadero si el proceso fue removido.
   */
  deleteProcess(pid) {
    return this.processes.delete(pid);
  }

  clearProcesses() {
    this.processes = new Map();
  }
}