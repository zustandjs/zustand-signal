/** @jsxImportSource zustand-signal */

import { createStore } from 'zustand';
import { $ } from 'zustand-signal';

const signal = <T,>(initialValue: T) => $(createStore(() => initialValue));

const count = signal(0);

setInterval(() => {
  if (count.value > 100) {
    count.value = 0;
  } else {
    ++count.value;
  }
}, 100);

const Component = () => {
  return (
    <div>
      <pre>
        {`
const count = signal(0);

setInterval(() => {
  if (count.value > 100) {
    count.value = 0;
  } else {
    ++count.value;
  }
}, 100);

const Component = () => (
  <div style={{ position: 'relative', left: count }}>
    Random: {Math.random()}
  </div>
)
      `}
      </pre>
      <div style={{ position: 'relative', left: count }}>
        Random: {Math.random()}
      </div>
    </div>
  );
};

const App = () => (
  <>
    <h1>signal() demo</h1>
    <Component />
  </>
);

export default App;
