import { useEffect, useRef, useState } from "preact/hooks";
import { Message } from "../types.ts";
import { WalkDeno } from "../components/WalkDeno.tsx";

function interpolate(
  t: number,
  x1: number,
  x2: number,
) {
  return x1 + (x2 - x1) * t;
}

interface CharaProps {
  x: number;
  y: number;
  username: string;
  uid: string;
  messages: Message[];
  color: string;
}
export function Chara({ x, y, username, messages, uid, color }: CharaProps) {
  const svgRef = useRef<SVGGElement>(null);
  const [isWalk, setIsWalk] = useState(false);
  const [direction, setDirection] = useState(0);
  const [frame, setFrame] = useState(0);

  const [x1, setX1] = useState(x);
  const [y1, setY1] = useState(y);
  const [x2, setX2] = useState(x);
  const [y2, setY2] = useState(y);

  const [t, setT] = useState(1);
  const [duration, setDuration] = useState(0);
  const speed = 500;

  useEffect(() => {
    setX1(x);
    setY1(y);
    setX2(x);
    setY2(y);
    setT(0);
  }, []);

  useEffect(() => {
    const old = {
      x: interpolate(t, x1, x2),
      y: interpolate(t, y1, y2),
    };
    setX1(old.x);
    setY1(old.y);
    setX2(x);
    setY2(y);
    setT(0);

    const dist = Math.sqrt((x - old.x) ** 2 + (y - old.y) ** 2);
    setDuration(dist / speed);
    setIsWalk(true);

    setDirection((direction) => {
      if (old.x < x && old.y < y) {
        return 0;
      } else if (old.x > x && old.y < y) {
        return 2;
      } else if (old.x < x && old.y > y) {
        return 1;
      } else if (old.x > x && old.y > y) {
        return 3;
      }
      return direction;
    });
  }, [x, y, x1, y1, x2, y2]);

  const animationInterval = useRef(0);
  const [walkTimer, setWalkTimer] = useState(0);

  const animate = (ts: number) => {
    const x = interpolate(t, x1, x2);
    const y = interpolate(t, y1, y2);

    if (svgRef && svgRef.current) {
      svgRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
    const delta = 1 / duration / 100;
    if (t < 1 - delta) {
      setT((t) => t + delta);
    } else {
      setX1(x2);
      setY1(y2);
      setT(0);
      setIsWalk(false);
    }

    if (ts - walkTimer > 100 && isWalk) {
      setFrame((frame) => (frame + 1) % 4);
      setWalkTimer(ts);
    }

    animationInterval.current = requestAnimationFrame(animate);
  };
  useEffect(() => {
    animationInterval.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationInterval.current);
  }, [animate]);

  const currentMessage = messages.filter((message) => message.uid === uid)
    .slice().reverse()
    .shift();

  return (
    <g>
      <g ref={svgRef}>
        <text
          x={0}
          y={20}
          fill="white"
          stroke="#88F"
          stroke-width="4"
          font-size="13"
          font-weight="bold"
          font-family="sans-serif"
          text-anchor="middle"
          stroke-linejoin="round"
        >
          {username}
        </text>
        <text
          x={0}
          y={20}
          fill="white"
          font-size="13"
          font-weight="bold"
          font-family="sans-serif"
          text-anchor="middle"
        >
          {username}
        </text>
        <WalkDeno
          x={-50}
          y={-100}
          index={frame}
          direction={direction}
          color={color}
          isWalk={false}
        />
        {currentMessage && (
          <g>
            <rect
              x={-100}
              y={-160}
              width={200}
              height={60}
              fill="rgba(253,253,253,0.8)"
              rx={10}
              ry={10}
            />
            <polygon
              points="-10,-10 10,-10 0,10"
              fill="rgba(253,253,253,0.8)"
              transform={`translate(0, -90)`}
            />

            <foreignObject x={-100} y={-160} width={200} height={60}>
              {
                <div class="flex justify-center items-center h-full p-4 text-center font-medium">
                  {currentMessage.body}
                </div>
              }
            </foreignObject>
          </g>
        )}
      </g>
    </g>
  );
}
