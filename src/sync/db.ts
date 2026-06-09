import { init } from '@instantdb/react';

const appId = import.meta.env.VITE_INSTANTDB_APP_ID;

export const db = appId ? init({ appId }) : null;
