// Decorative background animations - flames, horse, particles
import horseImg from '../assets/images/horse.png';

function HorseSilhouette() {
  return (
    <div className="horse-track">
      <div className="horse-img-wrap">
        {/* Public domain galloping horse silhouette */}
        <img
          className="horse-img"
          src={horseImg}
          alt=""
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function BackgroundDecorations() {
  const FLAMES = Array.from({ length: 12 }, (_, i) => i);
  const PARTICLES = Array.from({ length: 20 }, (_, i) => i);

  return (
    <>
      {/* Floating Particles */}
      <div className="bg-particles">
        {PARTICLES.map(i => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${(i * 5.3) % 100}%`,
              animationDuration: `${6 + (i % 7)}s`,
              animationDelay: `${(i * 0.7) % 5}s`,
            }}
          />
        ))}
      </div>

      {/* Flame row at bottom */}
      <div className="flame-container">
        {FLAMES.map(i => (
          <div
            key={i}
            className="flame"
            style={{
              animationDelay: `${(i * 0.3) % 1.5}s`,
              transform: `scale(${0.6 + (i % 3) * 0.2})`,
            }}
          >
            <div className="flame-outer" />
            <div className="flame-inner" />
            <div className="flame-base" />
          </div>
        ))}
      </div>

      {/* Running horse - dramatic SVG silhouette */}
      <HorseSilhouette />
    </>
  );
}

export default BackgroundDecorations;

