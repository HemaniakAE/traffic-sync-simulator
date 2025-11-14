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
        background: lights.red ? '#ff2d2d' : '#444',
        boxShadow: lights.red ? '0 0 10px #ff2d2d' : 'none'
      }} />
      <div style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        background: lights.yellow ? '#ffe733' : '#444',
        boxShadow: lights.yellow ? '0 0 10px #ffe733' : 'none'
      }} />
      <div style={{
        width: '26px',
        height: '26px',
        borderRadius: '50%',
        background: lights.green ? '#26ff5a' : '#444',
        boxShadow: lights.green ? '0 0 10px #26ff5a' : 'none'
      }} />
    </div>
  );
}

export default Semaforo;