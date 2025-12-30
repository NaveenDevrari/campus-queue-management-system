import { useEffect, useRef } from "react";

export default function FloatingBlueBall({
  size = 120,
  color = "bg-blue-400/50",
  speed = 1,
}) {
  const ballRef = useRef(null);

  useEffect(() => {
    const ball = ballRef.current;
    if (!ball) return;

    let x = Math.random() * (window.innerWidth - size);
    let y = Math.random() * (window.innerHeight - size);

    let vx = (0.4 + Math.random()) * speed;
    let vy = (0.4 + Math.random()) * speed;

    const animate = () => {
      x += vx;
      y += vy;

      // bounce from walls
      if (x <= 0 || x + size >= window.innerWidth) vx *= -1;
      if (y <= 0 || y + size >= window.innerHeight) vy *= -1;

      ball.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(animate);
    };

    animate();
  }, [size, speed]);

  return (
    <div
      ref={ballRef}
      className={`
        fixed top-0 left-0
        rounded-full blur-2xl
        pointer-events-none
        ${color}
      `}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}
