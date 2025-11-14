import React from "react";
import { FaTrafficLight } from "react-icons/fa";
import './ReturnButton.css'

function ReturnButton() {
    return (
        <div className="return-button">
            <button>
                <FaTrafficLight size={36}/>
            </button>
        </div>
    );
}

export default ReturnButton;