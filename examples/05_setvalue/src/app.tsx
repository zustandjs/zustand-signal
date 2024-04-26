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
  const prevCount = $(store).count.value;
  const nextCount = prevCount + 1;
  $(store).count.value = nextCount;
  const prevDataCount = $(store).data.count.value;
  const nextDataCount = prevDataCount + 1;
  $(store).data.count.value = nextDataCount;
};

const CounterWithSignal = () => {
  return (
    <div>
      <h1>With $(store)</h1>
      <div>Count: {$(store).count}</div>
      <div>Count: {$(store).count}</div>
      <div>Another Count: {$(store).data.count}</div>
      <div>Another Count: {$(store).data.count}</div>
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
