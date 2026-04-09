import { useRef, useState, useCallback, type RefObject, type CSSProperties } from 'react';
import type { ElementPosition } from '../types';

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function useCanvasDrag(
  containerRef: RefObject<HTMLElement | null>,
  position: ElementPosition | undefined,
  onPositionChange: (pos: ElementPosition) => void,
) {
  const [dragging, setDragging] = useState(false);
  const [livePos, setLivePos] = useState<ElementPosition | null>(null);
  const offsetRef = useRef({ ox: 0, oy: 0 });
  const didDrag = useRef(false);

  const getContainerRect = useCallback(() => {
    return containerRef.current?.getBoundingClientRect() ?? null;
  }, [containerRef]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      const rect = getContainerRect();
      if (!rect) return;

      const elRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      offsetRef.current = {
        ox: e.clientX - (elRect.left + elRect.width / 2),
        oy: e.clientY - (elRect.top + elRect.height / 2),
      };

      setDragging(true);
      didDrag.current = false;
    },
    [getContainerRect],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      e.preventDefault();
      e.stopPropagation();
      didDrag.current = true;

      const rect = getContainerRect();
      if (!rect) return;

      const centerX = e.clientX - offsetRef.current.ox;
      const centerY = e.clientY - offsetRef.current.oy;

      const x = clamp(((centerX - rect.left) / rect.width) * 100, 2, 98);
      const y = clamp(((centerY - rect.top) / rect.height) * 100, 2, 98);

      setLivePos({ x, y });
    },
    [dragging, getContainerRect],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      e.stopPropagation();
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      setDragging(false);

      if (livePos && didDrag.current) {
        onPositionChange(livePos);
      }
      setLivePos(null);
    },
    [dragging, livePos, onPositionChange],
  );

  const currentPos = livePos ?? position;

  const style: CSSProperties | undefined = currentPos
    ? {
        position: 'absolute',
        left: `${currentPos.x}%`,
        top: `${currentPos.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: dragging ? 'grabbing' : 'grab',
        zIndex: dragging ? 50 : 10,
        touchAction: 'none',
      }
    : undefined;

  return {
    style,
    handlers: { onPointerDown, onPointerMove, onPointerUp },
    dragging,
    didDrag,
    hasPosition: !!currentPos,
  };
}
