/** @jsxImportSource zustand-signal */

/* eslint react/no-unknown-property: off */

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { createStore } from 'zustand';
import { $ } from 'zustand-signal';

const store = createStore<{
  count: number;
  inc: () => void;
}>((set) => ({
  count: 0,
  inc: () =>
    set((state) => ({ count: state.count < 5 ? state.count + 1 : -5 })),
}));

setInterval(store.getState().inc, 500);

const Counter = () => (
  <mesh position={[$(store).count, 0, 0]}>
    <boxGeometry />
    <meshBasicMaterial color="red" />
  </mesh>
);

const App = () => (
  <Canvas>
    <ambientLight intensity={0.5} />
    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
    <pointLight position={[-10, -10, -10]} />
    <Counter />
    <OrbitControls />
  </Canvas>
);

export default App;
