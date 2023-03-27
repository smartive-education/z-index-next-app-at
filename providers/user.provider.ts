import { createContext } from 'react';
import { initialUserState } from '../state/states';

export const UserContext = createContext(initialUserState);
