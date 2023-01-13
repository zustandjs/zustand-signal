/** @jsxImportSource zustand-signal */

import { createStore, useStore } from 'zustand';
import { $ } from 'zustand-signal';

const store = createStore<{
  count: number;
  inc: () => void;
}>((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

const CounterWithSignal = () => {
  return (
    <div>
      <h1>With $(store, selector)</h1>
      <div
        style={{ position: 'relative', left: $(store, (state) => state.count) }}
      >
        Random: {Math.random()}
      </div>
    </div>
  );
};

const Counter = () => {
  const count = useStore(store, (state) => state.count);
  return (
    <div>
      <h1>With useStore(store, selector)</h1>
      <div style={{ position: 'relative', left: count }}>
        Random: {Math.random()}
      </div>
    </div>
  );
};

const Controls = () => {
  const inc = useStore(store, (state) => state.inc);
  return (
    <div>
      <button type="button" onClick={inc}>
        Increment
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
