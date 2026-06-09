import { Buffer as BufferPolyfill } from 'buffer/';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.Buffer = BufferPolyfill as any;

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
