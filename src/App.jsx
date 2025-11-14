import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, ShoppingCart } from 'lucide-react';
import Semaforo from './Components/Semaforo';
import PanelControl from './Components/Controles';


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
    north: { top: -100, visible: false },
    south: { bottom: -100, visible: false },
    east: { right: -100, visible: false },
    west: { left: -100, visible: false }
  });

  const cycleRef = useRef(0);
  const animationRef = useRef(null);
  const isRunningRef = useRef(false);

  // Configuración de ciclos
  const CYCLE_CONFIG = {
    green: 5000,    // 8 segundos
    yellow: 2000,   // 2 segundos
    red: 1000       // 1 segundo
  };

  // Velocidad más lenta y suave
  const CAR_SPEED = 10;

  // Controlador de semáforos con computación paralela
  const trafficController = useRef({
    workers: {},
    
    initWorkers() {
      ['N', 'S', 'E', 'O'].forEach(direction => {
        this.workers[direction] = {
          direction,
          phase: 'red',
          timer: null
        };
      });
    },

    async runCycle(cycleNumber) {
      // Ciclo par
      if (cycleNumber % 2 === 0) {
        await this.setLights('N', 'S', 'E', 'O');
      } 
      // Ciclo impar
      else {
        await this.setLights('E', 'O', 'N', 'S');
      }
    },

    async setLights(green1, green2, red1, red2) {
      if (!isRunningRef.current) return;

      // Resetear posiciones y hacer visibles los carritos que van a moverse
      this.resetAndShowCars([green1, green2]);

      // Verde para un par
      setTrafficLights({
        [green1]: { red: false, yellow: false, green: true },
        [green2]: { red: false, yellow: false, green: true },
        [red1]: { red: true, yellow: false, green: false },
        [red2]: { red: true, yellow: false, green: false }
      });

      // Iniciar movimiento
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

      // Ocultar carritos que estaban en movimiento
      this.hideCars([green1, green2]);

      // Rojo para todos
      setTrafficLights({
        [green1]: { red: true, yellow: false, green: false },
        [green2]: { red: true, yellow: false, green: false },
        [red1]: { red: true, yellow: false, green: false },
        [red2]: { red: true, yellow: false, green: false }
      });

      await this.sleep(CYCLE_CONFIG.red);
    },

    resetAndShowCars(directions) {
      const newPositions = {};
      directions.forEach(dir => {
        const dirMap = { N: 'north', S: 'south', E: 'east', O: 'west' };
        const mappedDir = dirMap[dir];
        
        // Resetear a posición inicial y hacer visible
        if (mappedDir === 'north' || mappedDir === 'south') {
          newPositions[mappedDir] = { 
            [mappedDir === 'north' ? 'top' : 'bottom']: -100,
            visible: true,
            moving: false
          };
        } else {
          newPositions[mappedDir] = { 
            [mappedDir === 'east' ? 'right' : 'left']: -100,
            visible: true,
            moving: false
          };
        }
      });
      
      setCarPositions(prev => ({
        ...prev,
        ...newPositions
      }));
    },

    moveCars(directions, shouldMove) {
      const newPositions = {};
      directions.forEach(dir => {
        const dirMap = { N: 'north', S: 'south', E: 'east', O: 'west' };
        newPositions[dirMap[dir]] = { moving: shouldMove, visible: true };
      });
      
      setCarPositions(prev => ({
        ...prev,
        ...newPositions
      }));
    },

    hideCars(directions) {
      const newPositions = {};
      directions.forEach(dir => {
        const dirMap = { N: 'north', S: 'south', E: 'east', O: 'west' };
        newPositions[dirMap[dir]] = { moving: false, visible: false };
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
      // Oculta todos los carritos cuando se pausa
      setCarPositions(prev => ({
        north: { ...prev.north, moving: false, visible: false },
        south: { ...prev.south, moving: false, visible: false },
        east: { ...prev.east, moving: false, visible: false },
        west: { ...prev.west, moving: false, visible: false }
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
        
        // Norte
        if (prev.north.moving && prev.north.visible) {
          const currentTop = prev.north.top ?? -100;
          const newTop = currentTop + CAR_SPEED;
          
          // Si sale de la pantalla se hace invisible
          if (newTop > window.innerHeight + 100) {
            newPos.north = {
              ...prev.north,
              top: -100,
              visible: false,
              moving: false
            };
          } else {
            newPos.north = {
              ...prev.north,
              top: newTop
            };
          }
        }

        // Sur
        if (prev.south.moving && prev.south.visible) {
          const currentBottom = prev.south.bottom ?? -100;
          const newBottom = currentBottom + CAR_SPEED;
          
          if (newBottom > window.innerHeight + 100) {
            newPos.south = {
              ...prev.south,
              bottom: -100,
              visible: false,
              moving: false
            };
          } else {
            newPos.south = {
              ...prev.south,
              bottom: newBottom
            };
          }
        }

        // Este
        if (prev.east.moving && prev.east.visible) {
          const currentRight = prev.east.right ?? -100;
          const newRight = currentRight + CAR_SPEED;
          
          if (newRight > window.innerWidth + 100) {
            newPos.east = {
              ...prev.east,
              right: -100,
              visible: false,
              moving: false
            };
          } else {
            newPos.east = {
              ...prev.east,
              right: newRight
            };
          }
        }

        // Oeste
        if (prev.west.moving && prev.west.visible) {
          const currentLeft = prev.west.left ?? -100;
          const newLeft = currentLeft + CAR_SPEED;
          
          if (newLeft > window.innerWidth + 100) {
            newPos.west = {
              ...prev.west,
              left: -100,
              visible: false,
              moving: false
            };
          } else {
            newPos.west = {
              ...prev.west,
              left: newLeft
            };
          }
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

      {/* Carritos - Solo visibles cuando están activos */}
      {carPositions.north.visible && (
        <div style={{
          position: 'absolute',
          fontSize: '48px',
          color: '#ff3333',
          zIndex: 10,
          top: `${carPositions.north.top}px`,
          left: 'calc(50% + 35px)'
        }}>
          <ShoppingCart size={48} />
        </div>
      )}

      {carPositions.south.visible && (
        <div style={{
          position: 'absolute',
          fontSize: '48px',
          color: '#3333ff',
          zIndex: 10,
          bottom: `${carPositions.south.bottom}px`,
          left: 'calc(50% - 35px)',
          transform: 'rotate(180deg)'
        }}>
          <ShoppingCart size={48} />
        </div>
      )}

      {carPositions.east.visible && (
        <div style={{
          position: 'absolute',
          fontSize: '48px',
          color: '#33ff33',
          zIndex: 10,
          right: `${carPositions.east.right}px`,
          top: 'calc(50% + 35px)',
          transform: 'scaleX(-1)'
        }}>
          <ShoppingCart size={48} />
        </div>
      )}

      {carPositions.west.visible && (
        <div style={{
          position: 'absolute',
          fontSize: '48px',
          color: '#ff33ff',
          zIndex: 10,
          left: `${carPositions.west.left}px`,
          top: 'calc(50% - 35px)'
        }}>
          <ShoppingCart size={48} />
        </div>
      )}

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
        zIndex: 9999,
        fontFamily: 'monospace'
      }}>
        Ciclo: {currentCycle} | Estado: {isRunning ? '🟢 En ejecución' : '🔴 Pausado'}
      </div>
    </div>
  );
}