/** @jsxImportSource zustand-signal */

import { createStore, useStore } from 'zustand';
import { $ } from 'zustand-signal';

const store = createStore<{
  id: number;
  user: string;
  fetchUser: (id: number) => Promise<void>;
}>((set) => ({
  id: 0,
  user: '',
  fetchUser: async (id: number) => {
    const response = await fetch(`https://reqres.in/api/users/${id}`);
    const { data } = await response.json();
    const user = `ID: ${data.id}, Name: ${data.first_name} ${data.last_name}`;
    set({ id, user });
  },
}));
store.getState().fetchUser(1);

const createRandomColor = () => `#${Math.random().toString(16).slice(-6)}`;

const UserWithSignal = () => {
  return (
    <div style={{ backgroundColor: createRandomColor() }}>
      User: {$(store).user}
    </div>
  );
};

const User = () => {
  const user = useStore(store, (state) => state.user);
  return (
    <div style={{ backgroundColor: createRandomColor() }}>User: {user}</div>
  );
};

const Controls = () => {
  const id = useStore(store, (state) => state.id);
  const fetchUser = useStore(store, (state) => state.fetchUser);
  return (
    <div>
      ID: {id}{' '}
      <button type="button" onClick={() => fetchUser(id - 1)}>
        Prev
      </button>{' '}
      <button type="button" onClick={() => fetchUser(id + 1)}>
        Next
      </button>
    </div>
  );
};

const App = () => (
  <>
    <Controls />
    <h1>With $(store)</h1>
    <UserWithSignal />
    <h1>With useStore(store, selector)</h1>
    <User />
  </>
);

export default App;
