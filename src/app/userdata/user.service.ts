import { Injectable } from '@angular/core';
import { UserBase } from './user.model';
import { UserStore } from './user.store';
import { UserQuery } from './user.query';
import { UserDataService } from './user-data.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private dataStore: UserStore,
    private dataQuery: UserQuery,
    private dataService: UserDataService
  ) {}

  updateUserdata(data: UserBase) {
    this.dataStore.upsert(data._id, data);
    this.dataService
      .upsert(data)
      .catch((err) => console.warn('Could not save: ', data._id));
  }

  loadAll() {
    return this.dataQuery.select();
  }
}
