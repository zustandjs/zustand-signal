/** @jsxImportSource zustand-signal */

import { createStore } from 'zustand';
import { $ } from 'zustand-signal';

const store = createStore<{
  count: number;
  data: { count: number };
}>(() => ({
  count: 0,
  data: { count: 100 },
}));

const inc = () => {
  const prevCount = ($(store).count as any)();
  const nextCount = prevCount + 1;
  ($(store).count as any)(nextCount);
  const prevDataCount = ($(store).data.count as any)();
  const nextDataCount = prevDataCount + 1;
  ($(store).data.count as any)(nextDataCount);
};

const CounterWithSignal = () => {
  return (
    <div>
      <h1>With $(store, selector)</h1>
      <div>Count: {$(store, (state) => state.count)}</div>
      <div>Another Count: {$(store, (state) => state.data.count)}</div>
      <div>({Math.random()})</div>
    </div>
  );
};

const Controls = () => {
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
  </>
);

export default App;
