import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, ShoppingCart } from 'lucide-react';

// Semáforo Component
function Semaforo({ direction, x, y, lights }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: '40px',
        height: '100px',
        background: '#222',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '8px',
        gap: '6px',
        zIndex: 20,
        boxShadow: '0 0 8px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-25px',
        fontSize: '20px',
        fontWeight: 'bold',
        color: 'white',
        textShadow: '1px 1px 2px black'
      }}>
        {direction}
      </div>

      <div style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        background: lights.red ? '#ff2d2d' : '#444'
      }} />
      <div style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        background: lights.yellow ? '#ffe733' : '#444'
      }} />
      <div style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        background: lights.green ? '#26ff5a' : '#444'
      }} />
    </div>
  );
}

// Panel de Control
function PanelControl({ onStart, onPause, onSkip, isRunning }) {
  return (
    <div style={{
      position: 'absolute',
      textAlign: 'center',
      top: '25px',
      left: '25px',
      width: '300px',
      background: 'rgb(0, 0, 0)',
      border: '2px solid white',
      padding: '15px',
      borderRadius: '10px',
      zIndex: 9999
    }}>
      <h2 style={{ color: 'white', marginBottom: '1em', marginTop: '0.5em' }}>Controles</h2>

      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <button
          onClick={onStart}
          disabled={isRunning}
          style={{
            width: '50px',
            height: '50px',
            background: isRunning ? '#cccccc' : '#faf9f9',
            border: '1px solid white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            color: '#000000'
          }}
        >
          <Play size={24} fill="black" />
        </button>

        <button
          onClick={onPause}
          disabled={!isRunning}
          style={{
            width: '50px',
            height: '50px',
            background: !isRunning ? '#cccccc' : '#faf9f9',
            border: '1px solid white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !isRunning ? 'not-allowed' : 'pointer',
            color: '#000000'
          }}
        >
          <Pause size={24} fill="black" />
        </button>

        <button
          onClick={onSkip}
          disabled={!isRunning}
          style={{
            width: '50px',
            height: '50px',
            background: !isRunning ? '#cccccc' : '#faf9f9',
            border: '1px solid white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: !isRunning ? 'not-allowed' : 'pointer',
            color: '#000000'
          }}
        >
          <SkipForward size={24} fill="black" />
        </button>
      </div>
    </div>
  );
}

// App Principal
export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  
  // Estados de los semáforos
  const [trafficLights, setTrafficLights] = useState({
    N: { red: true, yellow: false, green: false },
    S: { red: true, yellow: false, green: false },
    E: { red: true, yellow: false, green: false },
    O: { red: true, yellow: false, green: false }
  });

  // Posiciones de los carritos
  const [carPositions, setCarPositions] = useState({
    north: { top: -60, moving: false },
    south: { bottom: -60, moving: false },
    east: { right: -60, moving: false },
    west: { left: -60, moving: false }
  });

  const cycleRef = useRef(0);
  const animationRef = useRef(null);
  const isRunningRef = useRef(false);

  // Configuración de ciclos (en milisegundos)
  const CYCLE_CONFIG = {
    green: 5000,    // 5 segundos en verde
    yellow: 2000,   // 2 segundos en amarillo
    red: 7000       // 7 segundos en rojo
  };

  // Controlador de semáforos con computación paralela
  const trafficController = useRef({
    workers: {},
    
    initWorkers() {
      // Simulación de workers paralelos para cada semáforo
      ['N', 'S', 'E', 'O'].forEach(direction => {
        this.workers[direction] = {
          direction,
          phase: 'red',
          timer: null
        };
      });
    },

    async runCycle(cycleNumber) {
      // Ciclo 1: Norte-Sur en verde, Este-Oeste en rojo
      if (cycleNumber % 2 === 0) {
        await this.setLights('N', 'S', 'E', 'O');
      } 
      // Ciclo 2: Este-Oeste en verde, Norte-Sur en rojo
      else {
        await this.setLights('E', 'O', 'N', 'S');
      }
    },

    async setLights(green1, green2, red1, red2) {
      if (!isRunningRef.current) return;

      // Verde para un par
      setTrafficLights({
        [green1]: { red: false, yellow: false, green: true },
        [green2]: { red: false, yellow: false, green: true },
        [red1]: { red: true, yellow: false, green: false },
        [red2]: { red: true, yellow: false, green: false }
      });

      // Iniciar movimiento de carritos
      this.moveCars([green1, green2], true);

      await this.sleep(CYCLE_CONFIG.green);
      if (!isRunningRef.current) return;

      // Amarillo
      setTrafficLights({
        [green1]: { red: false, yellow: true, green: false },
        [green2]: { red: false, yellow: true, green: false },
        [red1]: { red: true, yellow: false, green: false },
        [red2]: { red: true, yellow: false, green: false }
      });

      await this.sleep(CYCLE_CONFIG.yellow);
      if (!isRunningRef.current) return;

      // Detener carritos
      this.moveCars([green1, green2], false);

      // Rojo para todos (transición segura)
      setTrafficLights({
        [green1]: { red: true, yellow: false, green: false },
        [green2]: { red: true, yellow: false, green: false },
        [red1]: { red: true, yellow: false, green: false },
        [red2]: { red: true, yellow: false, green: false }
      });

      await this.sleep(1000); // 1 segundo de seguridad
    },

    moveCars(directions, shouldMove) {
      const newPositions = {};
      directions.forEach(dir => {
        const dirMap = { N: 'north', S: 'south', E: 'east', O: 'west' };
        newPositions[dirMap[dir]] = { moving: shouldMove };
      });
      
      setCarPositions(prev => ({
        ...prev,
        ...newPositions
      }));
    },

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  });

  // Inicializar workers
  useEffect(() => {
    trafficController.current.initWorkers();
  }, []);

  // Loop principal del sistema
  useEffect(() => {
    isRunningRef.current = isRunning;

    if (!isRunning) {
      // Detener todos los carritos cuando se pausa
      setCarPositions(prev => ({
        north: { ...prev.north, moving: false },
        south: { ...prev.south, moving: false },
        east: { ...prev.east, moving: false },
        west: { ...prev.west, moving: false }
      }));
      return;
    }

    const runSystem = async () => {
      while (isRunningRef.current) {
        await trafficController.current.runCycle(cycleRef.current);
        if (!isRunningRef.current) break;
        cycleRef.current++;
        setCurrentCycle(cycleRef.current);
      }
    };

    runSystem();
  }, [isRunning]);

  // Animación de carritos
  useEffect(() => {
    const animate = () => {
      setCarPositions(prev => {
        const newPos = { ...prev };
        
        // Norte (se mueve hacia abajo)
        if (prev.north.moving) {
          const currentTop = prev.north.top || -60;
          newPos.north = {
            ...prev.north,
            top: currentTop >= window.innerHeight ? -60 : currentTop + 3
          };
        }

        // Sur (se mueve hacia arriba)
        if (prev.south.moving) {
          const currentBottom = prev.south.bottom || -60;
          newPos.south = {
            ...prev.south,
            bottom: currentBottom >= window.innerHeight ? -60 : currentBottom + 3
          };
        }

        // Este (se mueve hacia la izquierda)
        if (prev.east.moving) {
          const currentRight = prev.east.right || -60;
          newPos.east = {
            ...prev.east,
            right: currentRight >= window.innerWidth ? -60 : currentRight + 3
          };
        }

        // Oeste (se mueve hacia la derecha)
        if (prev.west.moving) {
          const currentLeft = prev.west.left || -60;
          newPos.west = {
            ...prev.west,
            left: currentLeft >= window.innerWidth ? -60 : currentLeft + 3
          };
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleSkip = async () => {
    if (!isRunning) return;
    cycleRef.current++;
    setCurrentCycle(cycleRef.current);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      background: 'repeating-linear-gradient(45deg, #1dd117, #1dd117 5px, #18b215 5px, #18b215 10px)',
      overflow: 'hidden'
    }}>
      {/* Carretera Vertical */}
      <div style={{
        position: 'absolute',
        width: '160px',
        height: '100vh',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#3b3b3b',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: '10px',
          height: '100%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(to bottom, #ffc800 0%, #ffc800 60%, transparent 60%, transparent 100%)',
          backgroundSize: '10px 45px',
          backgroundRepeat: 'repeat-y'
        }} />
      </div>

      {/* Carretera Horizontal */}
      <div style={{
        position: 'absolute',
        height: '160px',
        width: '100vw',
        top: '50%',
        transform: 'translateY(-50%)',
        background: '#3b3b3b',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          height: '10px',
          width: '100%',
          transform: 'translateY(-50%)',
          background: 'linear-gradient(to right, #ffc800 0%, #ffc800 60%, transparent 60%, transparent 100%)',
          backgroundSize: '45px 10px',
          backgroundRepeat: 'repeat-x'
        }} />
      </div>

      {/* Intersección */}
      <div style={{
        position: 'absolute',
        width: '150px',
        height: '170px',
        background: '#3b3b3b',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2
      }} />

      {/* Carritos usando lucide-react */}
      <div style={{
        position: 'absolute',
        fontSize: '48px',
        color: '#ff3333',
        zIndex: 10,
        top: `${carPositions.north.top}px`,
        left: 'calc(50% + 35px)',
        transition: 'top 0.016s linear'
      }}>
        <ShoppingCart size={48} />
      </div>

      <div style={{
        position: 'absolute',
        fontSize: '48px',
        color: '#3333ff',
        zIndex: 10,
        bottom: `${carPositions.south.bottom}px`,
        left: 'calc(50% - 35px)',
        transform: 'rotate(180deg)',
        transition: 'bottom 0.016s linear'
      }}>
        <ShoppingCart size={48} />
      </div>

      <div style={{
        position: 'absolute',
        fontSize: '48px',
        color: '#33ff33',
        zIndex: 10,
        right: `${carPositions.east.right}px`,
        top: 'calc(50% + 35px)',
        transform: 'scaleX(-1)',
        transition: 'right 0.016s linear'
      }}>
        <ShoppingCart size={48} />
      </div>

      <div style={{
        position: 'absolute',
        fontSize: '48px',
        color: '#ff33ff',
        zIndex: 10,
        left: `${carPositions.west.left}px`,
        top: 'calc(50% - 35px)',
        transition: 'left 0.016s linear'
      }}>
        <ShoppingCart size={48} />
      </div>

      {/* Semáforos */}
      <Semaforo 
        direction="N" 
        x="calc(50% - 60px)" 
        y="calc(50% - 200px)"
        lights={trafficLights.N}
      />
      <Semaforo 
        direction="S" 
        x="calc(50% + 20px)" 
        y="calc(50% + 90px)"
        lights={trafficLights.S}
      />
      <Semaforo 
        direction="E" 
        x="calc(50% + 100px)" 
        y="calc(50% - 60px)"
        lights={trafficLights.E}
      />
      <Semaforo 
        direction="O" 
        x="calc(50% - 200px)" 
        y="calc(50% - 60px)"
        lights={trafficLights.O}
      />

      {/* Panel de Control */}
      <PanelControl
        onStart={handleStart}
        onPause={handlePause}
        onSkip={handleSkip}
        isRunning={isRunning}
      />

      {/* Info del ciclo */}
      <div style={{
        position: 'absolute',
        bottom: '25px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '10px',
        border: '2px solid white',
        zIndex: 9999
      }}>
        Ciclo actual: {currentCycle} | Estado: {isRunning ? '🟢 En ejecución' : '🔴 Pausado'}
      </div>
    </div>
  );
}