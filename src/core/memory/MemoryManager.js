// MemoryManager.js
import { Page } from "./Page.js";

export class MemoryManager {
  constructor(ramSize = 10, diskSize = 100) {
    this.ram = [];
    this.disk = [];
    this.ramSize = ramSize;
    this.diskSize = diskSize;
    this.processes = []; // referencia opcional a los procesos activos
  }

  setProcesses(processList) {
    this.processes = processList;
  }

  loadProcessMemory(pid, size) {
    const pages = [];
    for (let i = 0; i < size; i++) {
      const page = new Page(pid, Math.floor(Math.random() * 1000));
      pages.push(page);
    }
    pages.forEach((page) => this.loadPage(page));
  }

  loadPage(page) {
    if (this.ram.length < this.ramSize) {
      this.ram.push(page);
    } else {
      this.evictPage();
      this.ram.push(page);
    }
  }

  evictPage() {
    if (this.ram.length === 0) return;
    let lruIndex = 0;
    let minTime = this.ram[0].lastUsed;
    for (let i = 1; i < this.ram.length; i++) {
      if (this.ram[i].lastUsed < minTime) {
        lruIndex = i;
        minTime = this.ram[i].lastUsed;
      }
    }
    const evicted = this.ram.splice(lruIndex, 1)[0];
    this.disk.push(evicted);
  }

  accessPage(pid) {
    const page = this.ram.find((p) => p.pid === pid);
    if (page) {
      page.lastUsed = Date.now();
      return page;
    }

    const diskIndex = this.disk.findIndex((p) => p.pid === pid);
    if (diskIndex !== -1) {
      const pageFromDisk = this.disk.splice(diskIndex, 1)[0];
      this.loadPage(pageFromDisk);
      return pageFromDisk;
    }

    return null;
  }

  /**
   * 🔍 Devuelve el PID del proceso con la página menos recientemente usada (LRU)
   */
  getLeastRecentlyUsedProcess() {
    if (this.ram.length === 0) return null;

    // Buscar la página con menor tiempo de uso
    const lruPage = this.ram.reduce((oldest, page) => {
      return page.lastUsed < oldest.lastUsed ? page : oldest;
    });

    return lruPage.pid;
  }

  /**
   * 🔧 Devuelve el estado completo de la memoria, incluyendo RAM, disco y LRU PID
   */
  getMemoryState() {
    const allPids = new Set([
      ...this.ram.map((p) => p.pid),
      ...this.disk.map((p) => p.pid),
    ]);

    const memoryState = [];

    for (const pid of allPids) {
      const process = this.processes?.find((p) => p.pid === pid);
      const logo = process?.logo || "/logos/default.svg";

      const pagesInRam = this.ram.filter((p) => p.pid === pid);
      const pagesInDisk = this.disk.filter((p) => p.pid === pid);

      memoryState.push({
        pid,
        logo,
        pagesInRam,
        pagesInDisk,
        totalPages: pagesInRam.length + pagesInDisk.length,
      });
    }

    return {
      ram: memoryState.filter((p) => p.pagesInRam.length > 0),
      disk: memoryState.filter((p) => p.pagesInDisk.length > 0),
      lruPid: this.getLeastRecentlyUsedProcess(), // ✅ agregado
    };
  }
}
