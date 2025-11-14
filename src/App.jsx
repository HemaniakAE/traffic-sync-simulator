import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, ShoppingCart } from 'lucide-react';
import Semaforo from './Components/Semaforo';
import PanelControl from './Components/Controles';
import ReturnButton from './Components/ReturnButton';
import './App.css';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [activeDirection, setActiveDirection] = useState('N');
  
  //Estados de los semáforos
  const [trafficLights, setTrafficLights] = useState({
    N: { red: true, yellow: false, green: false },
    S: { red: true, yellow: false, green: false },
    E: { red: true, yellow: false, green: false },
    O: { red: true, yellow: false, green: false }
  });

  const [carPositions, setCarPositions] = useState({
    north: { top: -100, visible: false },
    south: { bottom: -100, visible: false },
    east: { right: -100, visible: false },
    west: { left: -100, visible: false }
  });

  const cycleRef = useRef(0);
  const animationRef = useRef(null);
  const isRunningRef = useRef(false);

  //Tiempos de los semáforos
  const CYCLE_CONFIG = {
    green: 5000,
    yellow: 1000,
    red: 1000
  };

  const CAR_SPEED = 8;
  const ROTATION_ORDER = ['N', 'E', 'S', 'O'];

  const trafficController = useRef({
    workers: {},
    currentIndex: 0,
    
    initWorkers() {
      ROTATION_ORDER.forEach(direction => {
        this.workers[direction] = {
          direction,
          phase: 'red',
          timer: null
        };
      });
    },

    async runCycle() {
      const currentDirection = ROTATION_ORDER[this.currentIndex];
      setActiveDirection(currentDirection);

      await this.setLights(currentDirection);
      
      this.currentIndex = (this.currentIndex + 1) % ROTATION_ORDER.length;
    },

    async setLights(greenDirection) {
      if (!isRunningRef.current) return;

      this.resetAndShowCar(greenDirection);

      const newLights = {};
      ROTATION_ORDER.forEach(dir => {
        if (dir === greenDirection) {
          newLights[dir] = { red: false, yellow: false, green: true };
        } else {
          newLights[dir] = { red: true, yellow: false, green: false };
        }
      });
      setTrafficLights(newLights);

      this.moveCar(greenDirection, true);

      await this.sleep(CYCLE_CONFIG.green);
      if (!isRunningRef.current) return;

      newLights[greenDirection] = { red: false, yellow: true, green: false };
      setTrafficLights({ ...newLights });

      await this.sleep(CYCLE_CONFIG.yellow);
      if (!isRunningRef.current) return;

      this.hideCar(greenDirection);

      ROTATION_ORDER.forEach(dir => {
        newLights[dir] = { red: true, yellow: false, green: false };
      });
      setTrafficLights({ ...newLights });

      await this.sleep(CYCLE_CONFIG.red);
    },

    resetAndShowCar(direction) {
      const dirMap = { N: 'north', S: 'south', E: 'east', O: 'west' };
      const mappedDir = dirMap[direction];

      const pos = {};
      if (mappedDir === 'north' || mappedDir === 'south') {
        pos[mappedDir] = {
          [mappedDir === 'north' ? 'top' : 'bottom']: -100,
          visible: true,
          moving: false
        };
      } else {
        pos[mappedDir] = {
          [mappedDir === 'east' ? 'right' : 'left']: -100,
          visible: true,
          moving: false
        };
      }

      setCarPositions(prev => ({ ...prev, ...pos }));
    },

    moveCar(direction, shouldMove) {
      const dirMap = { N: 'north', S: 'south', E: 'east', O: 'west' };
      const mappedDir = dirMap[direction];

      setCarPositions(prev => ({
        ...prev,
        [mappedDir]: { ...prev[mappedDir], moving: shouldMove, visible: true }
      }));
    },

    hideCar(direction) {
      const dirMap = { N: 'north', S: 'south', E: 'east', O: 'west' };
      const mappedDir = dirMap[direction];

      setCarPositions(prev => ({
        ...prev,
        [mappedDir]: { moving: false, visible: false }
      }));
    },

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  });

  useEffect(() => {
    trafficController.current.initWorkers();
  }, []);

  useEffect(() => {
    isRunningRef.current = isRunning;

    //Posiciones de los carros
    if (!isRunning) {
      setCarPositions({
        north: { top: -100, moving: false, visible: false },
        south: { bottom: -100, moving: false, visible: false },
        east: { right: -100, moving: false, visible: false },
        west: { left: -100, moving: false, visible: false }
      });
      return;
    }

    const runSystem = async () => {
      while (isRunningRef.current) {
        await trafficController.current.runCycle();
        if (!isRunningRef.current) break;
        cycleRef.current++;
        setCurrentCycle(cycleRef.current);
      }
    };

    runSystem();
  }, [isRunning]);

  useEffect(() => {
    const animate = () => {
      setCarPositions(prev => {
        const newPos = { ...prev };

        if (prev.north.moving && prev.north.visible) {
          const t = prev.north.top ?? -100;
          const nt = t + CAR_SPEED;
          newPos.north = nt > window.innerHeight + 100
            ? { top: -100, visible: false, moving: false }
            : { ...prev.north, top: nt };
        }

        if (prev.south.moving && prev.south.visible) {
          const b = prev.south.bottom ?? -100;
          const nb = b + CAR_SPEED;
          newPos.south = nb > window.innerHeight + 100
            ? { bottom: -100, visible: false, moving: false }
            : { ...prev.south, bottom: nb };
        }

        if (prev.east.moving && prev.east.visible) {
          const r = prev.east.right ?? -100;
          const nr = r + CAR_SPEED;
          newPos.east = nr > window.innerWidth + 100
            ? { right: -100, visible: false, moving: false }
            : { ...prev.east, right: nr };
        }

        if (prev.west.moving && prev.west.visible) {
          const l = prev.west.left ?? -100;
          const nl = l + CAR_SPEED;
          newPos.west = nl > window.innerWidth + 100
            ? { left: -100, visible: false, moving: false }
            : { ...prev.west, left: nl };
        }

        return newPos;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleSkip = () => {
    if (!isRunning) return;
    trafficController.current.currentIndex =
      (trafficController.current.currentIndex + 1) % ROTATION_ORDER.length;
  };

  //Creación de los elementos html
  return (
    <div className="app-container">

      <ReturnButton />

      {/* Carreteras */}
      <div className="road-vertical">
        <div className="road-line-vertical" />
      </div>

      <div className="road-horizontal">
        <div className="road-line-horizontal" />
      </div>

      <div className="intersection" />

      {/* Carritos */}
      {carPositions.north.visible && (
        <div className="car car-north" style={{ top: `${carPositions.north.top}px` }}>
          <ShoppingCart size={48} />
        </div>
      )}

      {carPositions.south.visible && (
        <div
          className="car car-south"
          style={{ bottom: `${carPositions.south.bottom}px` }}
        >
          <ShoppingCart size={48} />
        </div>
      )}

      {carPositions.east.visible && (
        <div
          className="car car-east"
          style={{ right: `${carPositions.east.right}px` }}
        >
          <ShoppingCart size={48} />
        </div>
      )}

      {carPositions.west.visible && (
        <div
          className="car car-west"
          style={{ left: `${carPositions.west.left}px` }}
        >
          <ShoppingCart size={48} />
        </div>
      )}

      {/* Semáforos */}
      <Semaforo direction="N" x="calc(50% - 60px)" y="calc(50% - 200px)" lights={trafficLights.N} />
      <Semaforo direction="S" x="calc(50% + 20px)" y="calc(50% + 90px)" lights={trafficLights.S} />
      <Semaforo direction="E" x="calc(50% + 100px)" y="calc(50% - 60px)" lights={trafficLights.E} />
      <Semaforo direction="O" x="calc(50% - 200px)" y="calc(50% - 60px)" lights={trafficLights.O} />

      {/* Panel */}
      <PanelControl
        onStart={handleStart}
        onPause={handlePause}
        onSkip={handleSkip}
        isRunning={isRunning}
      />

      <div className="cycle-info">
        Ciclo: {currentCycle} | Activo: {activeDirection} | Estado:{" "}
        {isRunning ? "🟢 En ejecución" : "🔴 Pausado"}
      </div>


    </div>
  );
}
