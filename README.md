# zustand-signal

Another React binding for Zustand

## What it is

Typically, Zustand store is a React hook you can just use in React.
There's alternative library called [use-zustand](https://github.com/dai-shi/use-zustand).

This library provides yet another method.
It follows [jotai-signal](https://github.com/jotai-labs/jotai-signal),
which is a variant of [@preact/signals-react](https://www.npmjs.com/package/@preact/signals-react).

It allows to use the Zustand store in React without using hooks.
We don't need to follow the rules of hooks.

## How to use it

```jsx
/** @jsxImportSource zustand-signal */

import createStore from 'zustand/vanilla';
import { $ } from 'zustand-signal';

const store = createStore((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
}));

setInterval(() => {
  store.getState().inc();
}, 100);

const Counter = () => (
  <div>
    Count: {$(store, (state) => state.count)}
  </div>
);
```

## How it works

The pragma at the first line does the trick.
It will transform the code with signal to the code that React can handle.

### Original code

```jsx
/** @jsxImportSource zustand-signal */

const Counter = () => (
  <div>
    Count: {$(state, (state) => state.count)} ({Math.random()})
  </div>
);
```

### Pseudo transformed code

```jsx
import { useEffect, useMemo, useReducer } from 'react';

const Counter = () => {
  const rerender = useReducer((c) => c + 1, 0);
  useEffect(() => {
    let lastValue;
    const unsubscribe = store.subscribe(() => {
      const nextValue = store.getState().count;
      if (lastValue !== nextValue) {
        lastValue = nextValue;
        rerender();
      }
    });
    return unsubscribe;
  }, []);
  return (
    <div>
      {useMemo(() => 'Count: '), []}
      {store.getState().count}
      {useMemo(() => ` (${Math.random()})`, [])}
    </div>
  );
};
```
