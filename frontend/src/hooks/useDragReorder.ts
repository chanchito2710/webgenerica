import { useRef, useState, useCallback } from 'react';

export interface DragHandlers {
  draggable: true;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

interface DragState {
  dragIdx: number | null;
  overIdx: number | null;
}

export function useDragReorder<T>(
  items: T[],
  onReorder: (items: T[]) => void,
  axis: 'vertical' | 'horizontal' = 'vertical',
) {
  const [state, setState] = useState<DragState>({ dragIdx: null, overIdx: null });
  const itemEls = useRef<Map<number, HTMLElement>>(new Map());
  const touchActive = useRef(false);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      if (el) itemEls.current.set(index, el);
      else itemEls.current.delete(index);
    },
    [],
  );

  const reorder = useCallback(
    (from: number, to: number) => {
      if (from === to) return;
      const updated = [...items];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      onReorder(updated);
    },
    [items, onReorder],
  );

  const getItemHandlers = useCallback(
    (index: number): DragHandlers => ({
      draggable: true,

      onDragStart(e: React.DragEvent) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
        setState({ dragIdx: index, overIdx: null });
      },

      onDragOver(e: React.DragEvent) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setState((s) => (s.overIdx === index ? s : { ...s, overIdx: index }));
      },

      onDrop(e: React.DragEvent) {
        e.preventDefault();
        const from = Number(e.dataTransfer.getData('text/plain'));
        reorder(from, index);
        setState({ dragIdx: null, overIdx: null });
      },

      onDragEnd() {
        setState({ dragIdx: null, overIdx: null });
      },

      onTouchStart(e: React.TouchEvent) {
        e.stopPropagation();
        touchActive.current = true;
        setState({ dragIdx: index, overIdx: index });
      },

      onTouchMove(e: React.TouchEvent) {
        if (!touchActive.current) return;
        e.stopPropagation();
        const touch = e.touches[0];
        const pos = axis === 'horizontal' ? touch.clientX : touch.clientY;

        for (const [idx, el] of itemEls.current.entries()) {
          const rect = el.getBoundingClientRect();
          const start = axis === 'horizontal' ? rect.left : rect.top;
          const end = axis === 'horizontal' ? rect.right : rect.bottom;
          const mid = start + (end - start) / 2;

          if (pos >= start && pos <= end) {
            setState((s) => (s.overIdx === idx ? s : { ...s, overIdx: idx }));
            break;
          }
          if (pos < mid && idx === 0) {
            setState((s) => (s.overIdx === 0 ? s : { ...s, overIdx: 0 }));
            break;
          }
        }
      },

      onTouchEnd() {
        if (!touchActive.current) return;
        touchActive.current = false;
        setState((prev) => {
          if (prev.dragIdx !== null && prev.overIdx !== null && prev.dragIdx !== prev.overIdx) {
            reorder(prev.dragIdx, prev.overIdx);
          }
          return { dragIdx: null, overIdx: null };
        });
      },
    }),
    [reorder, axis],
  );

  return {
    dragIdx: state.dragIdx,
    overIdx: state.overIdx,
    isDragging: state.dragIdx !== null,
    setItemRef,
    getItemHandlers,
  };
}
