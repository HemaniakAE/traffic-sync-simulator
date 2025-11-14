import { Play, Pause, SkipForward, ShoppingCart } from 'lucide-react';

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

export default PanelControl;