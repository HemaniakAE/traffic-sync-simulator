import { IoIosCart } from "react-icons/io";
import Semaforo from "./Components/Semaforo";
import PanelControl from "./Components/Controles";
import "./App.css";

export default function App() {
  return (
    <div className="cross-container">
      <div className="road road-vertical"></div>
      <div className="road road-horizontal"></div>

      <div className="intersection-center"></div>

      {/* Carritos */}
      <IoIosCart className="car car-north" />
      <IoIosCart className="car car-south" />
      <IoIosCart className="car car-east" />
      <IoIosCart className="car car-west" />

      {/* Semáforos */}

      {/* Norte */}
      <Semaforo direction="N" x="calc(50% - 60px)" y="calc(50% - 200px)" />

      {/* Sur */}
      <Semaforo direction="S" x="calc(50% + 20px)" y="calc(50% + 90px)" />

      {/* Este */}
      <Semaforo direction="E" x="calc(50% + 100px)" y="calc(50% - 60px)" />

      {/* Oeste */}
      <Semaforo direction="O" x="calc(50% - 200px)" y="calc(50% - 60px)" />
      
      <div className="panel-control-controls">
        <PanelControl
          onStart={() => controller.start()}
          onPause={() => controller.pause()}
          onSkip={() => controller.nextCycle()}
        />
      </div>  
    </div>
  );
}
