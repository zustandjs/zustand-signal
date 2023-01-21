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
  const listeners = new Set<() => void>();
  let unsubscribe: Unsubscribe | undefined;
  const sub: Subscribe = (callback) => {
    if (!listeners.size) {
      unsubscribe = store.subscribe(() => {
        const nextSelected = selector(store.getState());
        if (!equalityFn(selected, nextSelected)) {
          selected = nextSelected;
          listeners.forEach((listener) => listener());
        }
      });
    }
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
      if (!listeners.size) {
        (unsubscribe as Unsubscribe)();
        unsubscribe = undefined;
      }
    };
  };
  const get: GetValue = () => {
    if (!listeners.size) {
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

const VALUE_PROP = Symbol();

export const getValueProp = <T extends { value: unknown }>(
  x: AttachValue<T>,
): AttachValue<T['value']> => (x as any)[VALUE_PROP];

const { getSignal, createElement } = createReactSignals(
  createSignal,
  'value',
  VALUE_PROP,
  use,
);

export { createElement };

type AttachValue<T> = T & { value: T } & {
  readonly [K in keyof T]: AttachValue<T[K]>;
};

export function $<T>(store: StoreApi<T>): AttachValue<T>;

export function $<T, S>(
  store: StoreApi<T>,
  selector: (state: T) => S,
  equalityFn?: (a: S, b: S) => boolean,
): AttachValue<S>;

export function $(
  store: StoreApi<unknown>,
  selector: (state: unknown) => unknown = identity,
  equalityFn: (a: unknown, b: unknown) => boolean = Object.is,
) {
  return getSignal(store, selector, equalityFn);
}
