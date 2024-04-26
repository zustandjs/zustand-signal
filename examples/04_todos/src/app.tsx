/** @jsxImportSource zustand-signal */

import { memo } from 'react';
import type { FormEvent } from 'react';
import { createStore, useStore } from 'zustand';
import { $ } from 'zustand-signal';

const createRandomColor = () => `hsl(${Math.random() * 360}deg,100%,50%)`;

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

const getFiltered = (
  todos: Todo[],
  filter: 'all' | 'completed' | 'incompleted',
) => {
  if (filter === 'all') {
    return todos;
  }
  if (filter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }
  return todos.filter((todo) => !todo.completed);
};

let nextId = 1;

const store = createStore<{
  filter: 'all' | 'completed' | 'incompleted';
  todos: Todo[];
  filtered: Todo[];
  setFilter: (filter: 'all' | 'completed' | 'incompleted') => void;
  addTodo: (title: string) => void;
  toggleTodo: (todo: Todo) => void;
  removeTodo: (todo: Todo) => void;
}>((set) => ({
  filter: 'all',
  todos: [],
  filtered: [],
  setFilter: (filter) =>
    set((state) => {
      const filtered = getFiltered(state.todos, filter);
      return { filter, filtered };
    }),
  addTodo: (title) =>
    set((state) => {
      const todos = [...state.todos, { id: nextId++, title, completed: false }];
      const filtered = getFiltered(todos, state.filter);
      return { todos, filtered };
    }),
  toggleTodo: (todo) =>
    set((state) => {
      const todos = state.todos.map((item) =>
        item === todo
          ? {
              ...item,
              completed: !item.completed,
            }
          : item,
      );
      const filtered = getFiltered(todos, state.filter);
      return { todos, filtered };
    }),
  removeTodo: (todo) =>
    set((state) => {
      const todos = state.todos.filter((item) => item !== todo);
      const filtered = getFiltered(todos, state.filter);
      return { todos, filtered };
    }),
}));

type RemoveFn = (item: Todo) => void;
type TodoItemProps = {
  todo: Todo;
  remove: RemoveFn;
};
const TodoItem = memo(function TodoItem({ todo, remove }: TodoItemProps) {
  const toggleCompleted = () => {
    store.getState().toggleTodo(todo);
  };
  return (
    <div style={{ backgroundColor: createRandomColor() }}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={toggleCompleted}
      />
      <span
        style={{
          textDecoration: todo.completed ? 'line-through' : '',
        }}
      >
        {todo.title}
      </span>
      <button type="button" onClick={() => remove(todo)}>
        Remove
      </button>
    </div>
  );
});

const Filter = () => {
  const filter = useStore(store, (state) => state.filter);
  const setFilter = useStore(store, (state) => state.setFilter);
  return (
    <div>
      {(['all', 'completed', 'incompleted'] as const).map((f) => (
        <label htmlFor={f} key={f}>
          <input
            name={f}
            type="radio"
            value={f}
            checked={filter === f}
            onChange={() => setFilter(f)}
          />
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </label>
      ))}
    </div>
  );
};

type FilteredProps = {
  remove: RemoveFn;
};
const Filtered = ({ remove }: FilteredProps) => (
  <div style={{ padding: 30, backgroundColor: createRandomColor() }}>
    {$(store).filtered.map((todo) => (
      <TodoItem key={todo.id} todo={todo} remove={remove} />
    ))}
  </div>
);

const TodoList = () => {
  const addTodo = useStore(store, (state) => state.addTodo);
  const remove: RemoveFn = useStore(store, (state) => state.removeTodo);
  const add = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = e.currentTarget.inputTitle.value;
    e.currentTarget.inputTitle.value = '';
    addTodo(title);
  };
  return (
    <form onSubmit={add}>
      <Filter />
      <div style={{ margin: 5 }}>
        <input name="inputTitle" placeholder="Enter title..." />
      </div>
      <Filtered remove={remove} />
    </form>
  );
};

const App = () => (
  <>
    <h1>Zustand-Signal TODOs App</h1>
    <TodoList />
  </>
);

export default App;
