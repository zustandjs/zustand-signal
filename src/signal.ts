/// <reference types="react/experimental" />

import ReactExports from 'react';
import type { StoreApi } from 'zustand/vanilla';
import { createReactSignals } from 'create-react-signals';

const use =
  ReactExports.use ||
  (<T>(
    promise: Promise<T> & {
      status?: 'pending' | 'fulfilled' | 'rejected';
      value?: T;
      reason?: unknown;
    },
  ): T => {
    if (promise.status === 'pending') {
      throw promise;
    } else if (promise.status === 'fulfilled') {
      return promise.value as T;
    } else if (promise.status === 'rejected') {
      throw promise.reason;
    } else {
      promise.status = 'pending';
      promise.then(
        (v) => {
          promise.status = 'fulfilled';
          promise.value = v;
        },
        (e) => {
          promise.status = 'rejected';
          promise.reason = e;
        },
      );
      throw promise;
    }
  });

type Unsubscribe = () => void;
type Subscribe = (callback: () => void) => Unsubscribe;
type GetValue = () => unknown;
type SetValue = (path: unknown[], value: unknown) => void;

const identity = <T>(x: T): T => x;

const updateValue = (obj: any, path: unknown[], value: unknown) => {
  if (!path.length) {
    return value;
  }
  const [first, ...rest] = path;
  const prevValue = obj[first as string];
  const nextValue = updateValue(prevValue, rest, value);
  if (Object.is(prevValue, nextValue)) {
    return obj;
  }
  const copied = Array.isArray(obj) ? obj.slice() : { ...obj };
  copied[first as string] = nextValue;
  return copied;
};

const createSignal = <T, S>(
  store: StoreApi<T>,
  selector: (state: T) => S,
  equalityFn: (a: S, b: S) => boolean,
): [Subscribe, GetValue, SetValue] => {
  let selected = selector(store.getState());
  let subscribers = 0;
  const sub: Subscribe = (callback) => {
    const unsubscribe = store.subscribe(() => {
      const nextSelected = selector(store.getState());
      if (!equalityFn(selected, nextSelected)) {
        selected = nextSelected;
        callback();
      }
    });
    subscribers++;
    return () => {
      subscribers -= 1;
      unsubscribe();
    };
  };
  const get: GetValue = () => {
    if (subscribers === 0) {
      selected = selector(store.getState());
    }
    return selected;
  };
  const set: SetValue = (path, value) => {
    if (selector !== identity) {
      throw new Error('Cannot set a value with a selector');
    }
    store.setState((prev) => updateValue(prev, path, value), true);
  };
  return [sub, get, set];
};

const { getSignal, createElement } = createReactSignals(createSignal, use);

export { createElement };

export function $<T>(store: StoreApi<T>): T;

export function $<T, S>(
  store: StoreApi<T>,
  selector: (state: T) => S,
  equalityFn?: (a: S, b: S) => boolean,
): S;

export function $(
  store: StoreApi<unknown>,
  selector: (state: unknown) => unknown = identity,
  equalityFn: (a: unknown, b: unknown) => boolean = Object.is,
) {
  return getSignal(store, selector, equalityFn);
}
