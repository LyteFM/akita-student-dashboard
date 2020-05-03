import { Injectable } from '@angular/core';
import { UserBase } from './user.model';
import { EntityState, EntityStore, StoreConfig } from '@datorama/akita';

export interface UserState extends EntityState<UserBase> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'user', idKey: '_id' })
export class UserStore extends EntityStore<UserState> {
  constructor() {
    super();
  }
}
