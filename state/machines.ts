import { createContext } from 'react';
import { assign, createMachine, InterpreterFrom } from 'xstate';
import { MumbleUsers } from '../models';

export interface UserMachineContext {
  mumbleUsers: MumbleUsers;
}

export interface LoadUsersEvent {
  type: 'LOAD_USERS';
  mumbleUsers: MumbleUsers;
}

export interface UpdateUsersEvent {
  type: 'UPDATE_USERS';
  mumbleUsers: MumbleUsers;
}

export const initialUsersMachineContext: UserMachineContext = {
  mumbleUsers: {},
};

export const UsersContext = createContext({
  userService: {} as InterpreterFrom<typeof usersMachine>,
});

export const usersMachine = createMachine({
  id: 'mumbleUsers',
  initial: 'empty',
  schema: {
    context: initialUsersMachineContext,
  },
  context: initialUsersMachineContext,
  predictableActionArguments: true,
  states: {
    empty: {
      on: {
        LOAD_USERS: {
          actions: [
            assign<UserMachineContext, LoadUsersEvent>({
              mumbleUsers: (context, event) =>
                (context.mumbleUsers = event.mumbleUsers),
            }),
          ],
          target: 'updated',
        },
      },
    },
    updated: {
      on: {
        UPDATE_USERS: {
          actions: [
            assign<UserMachineContext, UpdateUsersEvent>({
              mumbleUsers: (context, event) =>
                (context.mumbleUsers = event.mumbleUsers),
            }),
          ],
          target: 'updated',
          internal: false,
        },
      },
    },
  },
});
