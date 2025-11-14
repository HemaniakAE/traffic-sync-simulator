import "./Semaforo.css";

export default function Semaforo({ direction, x, y }) {
  return (
    <div
      className="semaforo"
      style={{
        left: x,
        top: y,
      }}
    >
      <div className="label">{direction}</div>

      <div className="light red"></div>
      <div className="light yellow"></div>
      <div className="light green"></div>
    </div>
  );
}
