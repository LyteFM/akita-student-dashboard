import { Injectable } from '@angular/core';
import { UserBase } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  db: PouchDB.Database;
  constructor(db: PouchDB.Database) {
    this.db = db;
  }

  upsert(obj: UserBase) {
    return this.db.put(obj);
  }

  getAll() {
    return this.db
      .allDocs({ keys: ['user', 'config'], include_docs: true })
      .then((res) => {
        res.rows.map((row) => (<any>row.doc) as UserBase);
      });
  }
}
