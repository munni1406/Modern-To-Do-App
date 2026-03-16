// import React, { useState, useEffect } from 'react';
// import { Plus, Sun, Moon, LogOut } from 'lucide-react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import TodoItem from './TodoItem';

// // Use environment variable for API URL in production, or relative path in unified deployment
// const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || '' });

// const TodoApp = () => {
//   const [todos, setTodos] = useState([]);
//   const [inputValue, setInputValue] = useState('');
//   const [filter, setFilter] = useState('all'); // all, active, completed
//   const { token, user, logout } = useAuth();

//   // Theme state
//   const [theme, setTheme] = useState(() => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme) return savedTheme;
//     if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
//       return 'dark';
//     }
//     return 'light';
//   });

//   // Apply and persist theme
//   useEffect(() => {
//     localStorage.setItem('theme', theme);
//     if (theme === 'dark') {
//       document.documentElement.setAttribute('data-theme', 'dark');
//     } else {
//       document.documentElement.removeAttribute('data-theme');
//     }
//   }, [theme]);

//   // Fetch todos from backend
//   useEffect(() => {
//     const fetchTodos = async () => {
//       try {
//         const res = await API.get('/api/todos', {
//           headers: { Authorization: `Bearer ${token}` }
//         });

//         // Defensive check: Ensure res.data is an array
//         if (Array.isArray(res.data)) {
//           setTodos(res.data);
//         } else {
//           console.error('Expected an array of todos but received:', typeof res.data, res.data);
//           setTodos([]); // Fallback to empty array
//         }
//       } catch (err) {
//         console.error('Failed to fetch todos', err);
//         setTodos([]); // Ensure state is an array even on failure
//       }
//     };

//     if (token) {
//       fetchTodos();
//     }
//   }, [token]);


//   const toggleTheme = () => {
//     setTheme(prev => prev === 'light' ? 'dark' : 'light');
//   };

//   const handleAddTodo = async (e) => {
//     e.preventDefault();
//     if (inputValue.trim() === '') return;

//     try {
//       const res = await API.post(
//         '/api/todos',
//         { task: inputValue.trim() },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const newTodo = {
//         id: res.data.id,
//         task: res.data.task,
//         completed: res.data.completed ? 1 : 0,
//         created_at: new Date().toISOString()
//       };

//       setTodos([newTodo, ...todos]);
//       setInputValue('');
//     } catch (err) {
//       console.error('Failed to add todo', err);
//     }
//   };

//   const toggleTodo = async (id) => {
//     const todoToToggle = todos.find(todo => todo.id === id);
//     if (!todoToToggle) return;

//     const newCompletedState = todoToToggle.completed ? 0 : 1;

//     // Optimistic update
//     setTodos(todos.map(todo =>
//       todo.id === id ? { ...todo, completed: newCompletedState } : todo
//     ));

//     try {
//       await API.put(
//         `/api/todos/${id}`,
//         { completed: newCompletedState },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     } catch (err) {
//       console.error('Failed to toggle todo', err);
//       // Revert if failed
//       setTodos(todos.map(todo =>
//         todo.id === id ? { ...todo, completed: todoToToggle.completed } : todo
//       ));
//     }
//   };

//   const deleteTodo = async (id) => {
//     // Optimistic update
//     const previousTodos = [...todos];
//     setTodos(todos.filter(todo => todo.id !== id));

//     try {
//       await API.delete(`/api/todos/${id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//     } catch (err) {
//       console.error('Failed to delete todo', err);
//       // Revert if failed
//       setTodos(previousTodos);
//     }
//   };

//   const editTodo = async (id, newText) => {
//     const todoToEdit = todos.find(todo => todo.id === id);
//     if (!todoToEdit) return;

//     // Optimistic update
//     setTodos(todos.map(todo =>
//       todo.id === id ? { ...todo, task: newText } : todo
//     ));

//     try {
//       await API.put(
//         `/api/todos/${id}`,
//         { task: newText },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     } catch (err) {
//       console.error('Failed to edit todo', err);
//       // Revert if failed
//       setTodos(todos.map(todo =>
//         todo.id === id ? { ...todo, task: todoToEdit.task } : todo
//       ));
//     }
//   };

//   const filteredTodos = (Array.isArray(todos) ? todos : []).filter(todo => {
//     if (filter === 'active') return !todo.completed;
//     if (filter === 'completed') return todo.completed;
//     return true; // 'all'
//   });

//   return (
//     <div className="todo-container">
//       <div className="todo-header">
//         <div className="header-top">
//           <div className="user-info">
//             <h1>Tasks</h1>
//             <span className="welcome-text">Hi, {user?.name || user?.email?.split('@')[0]}</span>
//           </div>
//           <div className="header-actions">
//             <button
//               className="theme-toggle-btn"
//               onClick={toggleTheme}
//               aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
//             >
//               {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
//             </button>
//             <button
//               className="logout-btn theme-toggle-btn"
//               onClick={logout}
//               aria-label="Logout"
//               style={{ marginLeft: '10px' }}
//             >
//               <LogOut size={20} />
//             </button>
//           </div>
//         </div>
//         <form className="add-todo-form" onSubmit={handleAddTodo}>
//           <input
//             type="text"
//             className="add-todo-input"
//             placeholder="What needs to be done?"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//           />
//           <button type="submit" className="add-todo-btn" disabled={!inputValue.trim()}>
//             <Plus size={20} />
//           </button>
//         </form>
//       </div>

//       {todos.length > 0 && (
//         <div className="todo-filters">
//           {['all', 'active', 'completed'].map(f => (
//             <button
//               key={f}
//               className={`filter-btn ${filter === f ? 'active' : ''}`}
//               onClick={() => setFilter(f)}
//             >
//               {f.charAt(0).toUpperCase() + f.slice(1)}
//             </button>
//           ))}
//         </div>
//       )}

//       <ul className="todo-list">
//         {todos.length === 0 ? (
//           <li className="empty-state">
//             Start by adding a task above
//           </li>
//         ) : filteredTodos.length === 0 ? (
//           <li className="empty-state">
//             No {filter} tasks found.
//           </li>
//         ) : (
//           filteredTodos.map(todo => (
//             <TodoItem
//               key={todo.id}
//               todo={{ id: todo.id, text: todo.task, completed: Boolean(todo.completed) }}
//               onToggle={toggleTodo}
//               onDelete={deleteTodo}
//               onEdit={editTodo}
//             />
//           ))
//         )}
//       </ul>
//     </div>
//   );
// };

// export default TodoApp;


import React, { useState, useEffect } from "react";
import { Plus, Sun, Moon, LogOut } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import TodoItem from "./TodoItem";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000"
});

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState("all");
  const { token, user, logout } = useAuth();

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  // Apply theme
  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [theme]);

  // Fetch todos
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await API.get("/api/todos", {
          headers: { Authorization: `Bearer ${token}` }
        });

        let todosData = [];

        if (Array.isArray(res.data)) {
          todosData = res.data;
        } else if (Array.isArray(res.data.todos)) {
          todosData = res.data.todos;
        }

        setTodos(todosData);
      } catch (err) {
        console.error("Failed to fetch todos", err);
        setTodos([]);
      }
    };

    if (token) fetchTodos();
  }, [token]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  // Add Todo
  const handleAddTodo = async e => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    try {
      const res = await API.post(
        "/api/todos",
        { task: inputValue.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newTodo = {
        id: res.data.id,
        task: res.data.task,
        completed: res.data.completed ? 1 : 0
      };

      setTodos(prev => [newTodo, ...prev]);
      setInputValue("");
    } catch (err) {
      console.error("Failed to add todo", err);
    }
  };

  // Toggle Todo
  const toggleTodo = async id => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newCompleted = todo.completed ? 0 : 1;

    setTodos(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: newCompleted } : t
      )
    );

    try {
      await API.put(
        `/api/todos/${id}`,
        { completed: newCompleted },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Toggle failed", err);

      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, completed: todo.completed } : t
        )
      );
    }
  };

  // Delete Todo
  const deleteTodo = async id => {
    const previous = [...todos];

    setTodos(prev => prev.filter(t => t.id !== id));

    try {
      await API.delete(`/api/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Delete failed", err);
      setTodos(previous);
    }
  };

  // Edit Todo
  const editTodo = async (id, newText) => {
    const original = todos.find(t => t.id === id);
    if (!original) return;

    setTodos(prev =>
      prev.map(t =>
        t.id === id ? { ...t, task: newText } : t
      )
    );

    try {
      await API.put(
        `/api/todos/${id}`,
        { task: newText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Edit failed", err);

      setTodos(prev =>
        prev.map(t =>
          t.id === id ? { ...t, task: original.task } : t
        )
      );
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="todo-container">

      <div className="todo-header">

        <div className="header-top">

          <div className="user-info">
            <h1>Tasks</h1>
            <span className="welcome-text">
              Hi, {user?.name || user?.email?.split("@")[0]}
            </span>
          </div>

          <div className="header-actions">

            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              className="logout-btn theme-toggle-btn"
              onClick={logout}
            >
              <LogOut size={20} />
            </button>

          </div>
        </div>

        <form className="add-todo-form" onSubmit={handleAddTodo}>

          <input
            className="add-todo-input"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
          />

          <button
            type="submit"
            className="add-todo-btn"
            disabled={!inputValue.trim()}
          >
            <Plus size={20} />
          </button>

        </form>

      </div>

      {todos.length > 0 && (
        <div className="todo-filters">

          {["all", "active", "completed"].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}

        </div>
      )}

      <ul className="todo-list">

        {todos.length === 0 ? (
          <li className="empty-state">
            Start by adding a task
          </li>
        ) : filteredTodos.length === 0 ? (
          <li className="empty-state">
            No {filter} tasks found
          </li>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={{
                id: todo.id,
                text: todo.task,
                completed: Boolean(todo.completed)
              }}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))
        )}

      </ul>

    </div>
  );
};

export default TodoApp;