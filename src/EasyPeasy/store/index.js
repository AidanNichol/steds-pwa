import { createStore } from 'easy-peasy'; // 👈 import
import storeModel from '../model';
console.log('storeModel', storeModel);
const store = createStore(storeModel); // 👈 create our store

export default store;
