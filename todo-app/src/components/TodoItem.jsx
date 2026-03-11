import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Edit2, Check } from 'lucide-react';

const TodoItem = ({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    if (editText.trim().length > 0) {
      onEdit(todo.id, editText.trim());
      setIsEditing(false);
    } else {
      setEditText(todo.text); // revert if empty
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSubmit();
    if (e.key === 'Escape') {
      setEditText(todo.text);
      setIsEditing(false);
    }
  };

  return (
    <li className="todo-item">
      <div 
        className={`checkbox-wrapper ${todo.completed ? 'completed' : ''}`}
        onClick={() => onToggle(todo.id)}
      >
        <Check className="checkbox-icon" strokeWidth={3} />
      </div>

      <div className="todo-content">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            className="edit-input"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span 
            className={`todo-text ${todo.completed ? 'completed' : ''}`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.text}
          </span>
        )}
      </div>

      {!isEditing && (
        <div className="todo-actions">
          <button 
            className="icon-btn edit" 
            onClick={() => setIsEditing(true)}
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="icon-btn delete" 
            onClick={() => onDelete(todo.id)}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </li>
  );
};

export default TodoItem;
