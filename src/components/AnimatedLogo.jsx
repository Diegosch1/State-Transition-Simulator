import React from "react";
import { motion } from "framer-motion";

const AnimatedLogo = ({ 
  logo, 
  start, 
  end, 
  duration = 1, 
  onComplete,
  size = 32,
  ease = "easeInOut"
}) => {
  // Validación de props requeridas
  if (!logo || !start || !end) {
    console.warn("AnimatedLogo: Missing required props (logo, start, end)");
    return null;
  }

  // Validación de coordenadas
  if (typeof start.x !== 'number' || typeof start.y !== 'number' ||
      typeof end.x !== 'number' || typeof end.y !== 'number') {
    console.warn("AnimatedLogo: Invalid coordinates provided");
    return null;
  }

  const handleAnimationComplete = () => {
    if (typeof onComplete === 'function') {
      onComplete();
    }
  };

  const handleError = (e) => {
    console.error(`Failed to load process logo: ${logo}`, e);
    // Podrías mostrar un placeholder o ícono por defecto
  };

  return (
    <motion.img
      src={logo}
      alt="Process Logo"
      width={size}
      height={size}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 1000,
        borderRadius: "4px", // Un poco de estilo
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)", // Sombra para destacar
      }}
      initial={{ 
        x: start.x + 60, 
        y: start.y + 60,
        opacity: 0,
        scale: 0.8
      }}
      animate={{ 
        x: end.x + 80, 
        y: end.y + 60,
        opacity: 1,
        scale: 1
      }}
      exit={{
        opacity: 0,
        scale: 0.8
      }}
      transition={{ 
        duration, 
        ease,
        opacity: { duration: duration * 0.3 }, // Fade más rápido
        scale: { duration: duration * 0.3 }
      }}
      onAnimationComplete={handleAnimationComplete}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default AnimatedLogo;