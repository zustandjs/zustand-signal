/// <reference types="react/experimental" />

import ReactExports from 'react';
import type { StoreApi } from 'zustand/vanilla';
import { createReactSignals } from 'create-react-signals';
import * as R from 'ramda';

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

const fixPath = (obj: unknown, path: unknown[]): (string | number)[] => {
  if (!path.length) {
    return [];
  }
  const first = path[0] as string;
  const rest = fixPath((obj as any)[first], path.slice(1));
  return [Array.isArray(obj) ? Number(first) : first, ...rest];
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
    // TODO it could be performant without using Ramda and make it 1-pass.
    store.setState(R.set(R.lensPath(fixPath(store.getState(), path)), value));
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
