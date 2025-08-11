import { createContext, useContext, useState } from 'react'

const DragDropContext = createContext({})

export const useDragDrop = () => {
  const context = useContext(DragDropContext)
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider')
  }
  return context
}

export const DragDropProvider = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)

  const handleDragStart = (item, type) => {
    setDraggedItem({ ...item, type })
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDropTarget(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (targetItem, onReorder) => {
    if (draggedItem && targetItem && draggedItem.id !== targetItem.id) {
      onReorder(draggedItem, targetItem)
    }
    handleDragEnd()
  }

  const value = {
    draggedItem,
    dropTarget,
    setDropTarget,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  }

  return (
    <DragDropContext.Provider value={value}>
      {children}
    </DragDropContext.Provider>
  )
}
