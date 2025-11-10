import React from "react";
import "./MemoryView.css";

export default function MemoryView({ memoryState }) {
  const { ram = [], disk = [], lruPid = null } = memoryState;

  const renderProcessBlock = (processGroup, index, type) => {
    const { pid, logo, pagesInRam = [], pagesInDisk = [], totalPages } = processGroup;

    const inRam = pagesInRam.length;
    const inDisk = pagesInDisk.length;
    const progress = totalPages > 0 ? (inRam / totalPages) * 100 : 0;

    // ✅ Si este proceso es el LRU, le añadimos una clase especial
    const isLRU = pid === lruPid;

    return (
      <div
        key={pid ?? index}
        className={`memory-block ${isLRU ? "lru-border" : ""}`}
        title={`PID: ${pid}${isLRU ? " (Menos recientemente usado)" : ""}`}
      >
        <img
          src={logo}
          alt={`Logo ${pid}`}
          className="process-logo"
          width={28}
          height={28}
        />
        <div className="pid-label">{pid}</div>
        <div className="page-count">
          {inRam}/{totalPages} pág en RAM
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    );
  };

  const renderSection = (title, list, capacity, type) => (
    <div className="memory-section">
      <h3>
        {title} (
        {list.reduce(
          (acc, p) =>
            acc + (type === "ram" ? p.pagesInRam.length : p.pagesInDisk.length),
          0
        )}
        /{capacity})
      </h3>
      <div className="memory-grid">
        {list.length > 0 ? (
          list.map((p, i) => renderProcessBlock(p, i, type))
        ) : (
          <div className="empty-msg">{title} vacía</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="memory-view-container">
      {renderSection("RAM", ram, 10, "ram")}
      {renderSection("Disco", disk, 100, "disk")}
    </div>
  );
}
