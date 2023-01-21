/** @jsxImportSource zustand-signal */

import { createStore, useStore } from 'zustand';
import { $ } from 'zustand-signal';

const store = createStore<{
  count: number;
  text: string;
  inc: () => void;
  changeText: () => void;
}>((set) => ({
  count: 0,
  text: 'hello',
  inc: () => set((state) => ({ count: state.count + 1 })),
  changeText: () => set((state) => ({ text: `${state.text}!` })),
}));

const CounterWithSignal = () => {
  return (
    <div>
      <h1>With $(store)</h1>
      Count: {$(store).count} ({Math.random()})
    </div>
  );
};

const Counter = () => {
  const count = useStore(store, (state) => state.count);
  return (
    <div>
      <h1>With useStore(store, selector)</h1>
      Count: {count} ({Math.random()})
    </div>
  );
};

const Controls = () => {
  const inc = useStore(store, (state) => state.inc);
  const changeText = useStore(store, (state) => state.changeText);
  return (
    <div>
      <button type="button" onClick={inc}>
        Increment
      </button>
      <button type="button" onClick={changeText}>
        Change text
      </button>
    </div>
  );
};

const App = () => (
  <>
    <Controls />
    <CounterWithSignal />
    <Counter />
  </>
);

export default App;
