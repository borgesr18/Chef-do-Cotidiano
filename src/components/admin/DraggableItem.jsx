import { useDragDrop } from './DragDropProvider'
import { GripVertical } from 'lucide-react'

export const DraggableItem = ({ 
  item, 
  type, 
  children, 
  onReorder, 
  className = '' 
}) => {
  const { handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useDragDrop()

  return (
    <div
      draggable
      onDragStart={() => handleDragStart(item, type)}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={() => handleDrop(item, onReorder)}
      className={`cursor-move ${className}`}
    >
      <div className="flex items-center gap-2">
        <GripVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
