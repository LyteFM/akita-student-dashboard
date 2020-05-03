import { formatISO } from 'date-fns';

export interface UserBase {
  _id: string;
  type: string;
  created: string;
  updated: string;
}

export interface User extends UserBase {
  name: string;
  age: number;
}

export interface Config extends UserBase {
  favourite: string;
}

export function createUser(params: Partial<User>) {
  return {
    _id: 'user',
    type: 'user',
    created: formatISO(new Date()),
    updated: formatISO(new Date()),
    name: params.name,
    age: params.age
  } as User;
}

export function createConfig() {
  return {
    _id: 'config',
    type: 'config',
    created: formatISO(new Date()),
    updated: formatISO(new Date()),
    favourite: ''
  } as Config;
}
