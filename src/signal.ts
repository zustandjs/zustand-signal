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

const createSignal = <T, S>(
  store: StoreApi<T>,
  selector: (state: T) => S,
  equalityFn: (a: S, b: S) => boolean,
): [Subscribe, GetValue, SetValue] => {
  let selected = selector(store.getState());
  const sub: Subscribe = (callback) =>
    store.subscribe(() => {
      const nextSelected = selector(store.getState());
      if (!equalityFn(selected, nextSelected)) {
        selected = nextSelected;
        callback();
      }
    });
  const get: GetValue = () => selected;
  const set: SetValue = (path, value) => {
    store.setState(R.set(R.lensPath(path as string[]), value));
  };
  return [sub, get, set];
};

const { getSignal, createElement } = createReactSignals(createSignal, use);

export { createElement };

const identity = <T>(x: T): T => x;

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
