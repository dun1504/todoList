import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdDelete,
  MdDone,
  MdClear,
  MdSearch,
  MdEdit,
  MdSave,
} from "react-icons/md";

const API_URL = "https://669f913eb132e2c136fe5b3c.mockapi.io/todo";

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [todosPerPage] = useState(5); // Số lượng todo trên mỗi trang

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    filterTodos();
  }, [todos, filter, searchTerm]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos: ", error);
    }
  };

  const addTodo = async () => {
    try {
      const response = await axios.post(API_URL, {
        title: newTodo,
        completed: false,
      });
      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {
      console.error("Error adding todo: ", error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error deleting todo: ", error);
    }
  };

  const toggleComplete = async (id, completed) => {
    try {
      await axios.put(`${API_URL}/${id}`, { completed: !completed });
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      );
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error updating todo: ", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
    setEditText(todo.title);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditText("");
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API_URL}/${editingTodo.id}`, { title: editText });
      const updatedTodos = todos.map((todo) =>
        todo.id === editingTodo.id ? { ...todo, title: editText } : todo
      );
      setTodos(updatedTodos);
      setEditingTodo(null);
      setEditText("");
    } catch (error) {
      console.error("Error updating todo: ", error);
    }
  };

  const handleEditChange = (e) => {
    setEditText(e.target.value);
  };

  const filterTodos = () => {
    let filtered = todos;
    if (filter === "COMPLETED") {
      filtered = todos.filter((todo) => todo.completed);
    } else if (filter === "INCOMPLETE") {
      filtered = todos.filter((todo) => !todo.completed);
    }
    if (searchTerm) {
      filtered = filtered.filter((todo) =>
        todo.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTodos(filtered);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  // Logic cho phân trang
  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="w-[800px] bg-gray-100 rounded-md m-auto p-3 mt-5">
      <h1 className="text-2xl font-bold mb-4 text-center text-black">
        Todo List
      </h1>
      <div className="flex mb-4">
        <input
          type="text"
          className="border-gray-300 border rounded-lg px-3 py-2 mr-2 w-full"
          placeholder="Add new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={addTodo}
        >
          Add
        </button>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex space-x-4 items-center">
          <select
            className="text-sm px-2 py-1 rounded border border-gray-300 focus:outline-none"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="ALL">Default</option>
            <option value="COMPLETED">Completed</option>
            <option value="INCOMPLETE">Incomplete</option>
          </select>

          <button
            className="text-sm px-2 py-1 bg-purple-500 text-white rounded ml-2"
            onClick={() => {
              const allCompleted = todos.every((todo) => todo.completed);
              if (!allCompleted) {
                const updatedTodos = todos.map((todo) => ({
                  ...todo,
                  completed: true,
                }));
                setTodos(updatedTodos);
              }
            }}
          >
            Mark All Completed
          </button>
        </div>
        <div className="flex items-center mb-4">
          <input
            className="flex-grow p-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
            type="text"
            placeholder="Search Todos"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button
            className="ml-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
            onClick={() =>
              setFilteredTodos(
                todos.filter((todo) =>
                  todo.title.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
            }
          >
            <MdSearch size={20} />
          </button>
        </div>
      </div>
      <ul>
        {currentTodos.length > 0 ? (
          currentTodos.map((todo, index) => (
            <li
              key={todo.id}
              className="flex items-center justify-between mb-2 border-b-2"
            >
              <div className="flex items-center">
                <span className="mr-4 text-gray-500">
                  {indexOfFirstTodo + index + 1}.
                </span>
                {editingTodo === todo ? (
                  <>
                    <input
                      type="text"
                      className="border-gray-300 border rounded-lg mb-2 px-2 py-1 mr-2"
                      value={editText}
                      onChange={handleEditChange}
                    />

                    <MdSave
                      size={22}
                      className="bg-gray-500 text-white mb-2 p-[2px] rounded-md"
                      onClick={saveEdit}
                    />

                    <MdClear
                      size={22}
                      className="bg-gray-500 text-white mb-2 p-[2px] rounded-md ml-2"
                      onClick={cancelEdit}
                    />
                  </>
                ) : (
                  <span
                    className={`my-2 text-sm italic ${
                      todo.completed ? "line-through" : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {editingTodo !== todo && (
                  <>
                    {todo.completed ? (
                      <MdClear
                        size={22}
                        className="ml-2 p-1 text-gray-600 bg-gray-300 rounded-md cursor-pointer"
                        onClick={() => toggleComplete(todo.id, todo.completed)}
                      />
                    ) : (
                      <MdDone
                        size={22}
                        className="ml-2 p-1 text-gray-600 bg-gray-300 rounded-md cursor-pointer"
                        onClick={() => toggleComplete(todo.id, todo.completed)}
                      />
                    )}
                    <MdEdit
                      size={22}
                      className="ml-2 p-1 text-gray-600 bg-gray-300 rounded-md cursor-pointer"
                      onClick={() => handleEdit(todo)}
                    />
                  </>
                )}
                <MdDelete
                  size={22}
                  className="text-gray-600 cursor-pointer p-1 rounded-md bg-gray-300"
                  onClick={() => deleteTodo(todo.id)}
                />
              </div>
            </li>
          ))
        ) : (
          <p>No todos found.</p>
        )}
      </ul>

      {/* Phân trang */}
      <ul className="flex justify-center mt-4">
        {Array.from({ length: Math.ceil(filteredTodos.length / todosPerPage) }).map(
          (_, index) => (
            <li
              key={index}
              className={`mx-1 px-3 py-1 rounded-md cursor-pointer ${
                currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => paginate(index + 1)}
            >
              {index + 1}
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default TodoList;
