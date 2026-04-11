import type { ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { useDragReorder } from '../../hooks/useDragReorder';

interface Props<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  keyFn?: (item: T, index: number) => string | number;
}

export default function DragList<T>({ items, onChange, renderItem, keyFn }: Props<T>) {
  const drag = useDragReorder(items, onChange);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const h = drag.getItemHandlers(i);
        const isOver = drag.overIdx === i && drag.dragIdx !== null && drag.dragIdx !== i;
        return (
          <div
            key={keyFn ? keyFn(item, i) : i}
            ref={drag.setItemRef(i)}
            draggable
            onDragStart={h.onDragStart}
            onDragOver={h.onDragOver}
            onDrop={h.onDrop}
            onDragEnd={h.onDragEnd}
            className={`flex items-start gap-2 border rounded-lg p-3 bg-white transition-all ${
              drag.dragIdx === i ? 'opacity-50 scale-[0.98]' : ''
            } ${isOver ? 'border-primary shadow-sm ring-2 ring-primary/20' : ''}`}
          >
            <div
              className="cursor-grab active:cursor-grabbing touch-none pt-1 shrink-0"
              onTouchStart={h.onTouchStart}
              onTouchMove={h.onTouchMove}
              onTouchEnd={h.onTouchEnd}
            >
              <GripVertical size={16} className="text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">{renderItem(item, i)}</div>
          </div>
        );
      })}
    </div>
  );
}
