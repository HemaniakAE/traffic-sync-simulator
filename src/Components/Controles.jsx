import React from "react";
import { VscDebugStart } from "react-icons/vsc";
import { GrPause } from "react-icons/gr";
import { TbPlayerSkipForward } from "react-icons/tb";
import "./Controles.css";

function PanelControl({ onStart, onPause, onSkip }) {
  return (
    <div className="panel-control">
      <h2>Controles</h2>

      <div className="buttons-wrapper">
        <button className="start-button" onClick={onStart}>
          <div className="icon">
            <VscDebugStart size={24} color="black" />
          </div>
        </button>

        <button className="stop-button" onClick={onPause}>
          <div className="icon">
            <GrPause size={24} />
          </div>
        </button>

        <button className="jump-button" onClick={onSkip}>
          <div className="icon">
            <TbPlayerSkipForward size={24} />
          </div>
        </button>
      </div>
    </div>
  );
}

export default PanelControl;
