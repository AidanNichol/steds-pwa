import React from 'react';
import { Store, emptyStore } from './store.js';
import { db } from './testDB.js';

export const store = Store.create(emptyStore, { db, useFullHistory: true });
store.load();
export const StoreContext = React.createContext(store);
