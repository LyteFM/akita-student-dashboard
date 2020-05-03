import { Injectable, OnInit, Inject } from '@angular/core';
import { ID, StateHistoryPlugin, PaginationResponse } from '@datorama/akita';
import { StudentStore, StudentState } from './student.store';
import { Student } from './student.model';
import { switchMap, map, multicast, filter, tap } from 'rxjs/operators';
import { StudentDataService } from './student-data.service';
import { StudentQuery } from './student.query';
import { BehaviorSubject, from } from 'rxjs';
import {
  CustomPaginationResponse,
  CustomPaginatorPlugin
} from 'src/app/paginator/customPaginator';
import { STUDENT_PAGINATOR } from './student.paginator';

@Injectable({ providedIn: 'root' })
export class StudentService {
  stateHistory: StateHistoryPlugin<StudentState>;
  students$: any;
  subject: BehaviorSubject<CustomPaginationResponse<Student>>;
  /** queries against PouchDB that have already been made */
  queryCache: Set<string> = new Set();
  /**
   * queries have been made against this key. If a new docs comes in
   * via sync that has this type, I'd need to invalidate -> unless I say
   * that any new doc will always be added to the store!!!
   */
  keyToQuery: Map<string, string> = new Map();

  constructor(
    private studentStore: StudentStore,
    private studentDataService: StudentDataService,
    private studentQuery: StudentQuery,
    @Inject(STUDENT_PAGINATOR)
    private paginatorRef: CustomPaginatorPlugin<Student>
  ) {
    this.stateHistory = new StateHistoryPlugin(this.studentQuery);
    const subject$ = new BehaviorSubject<CustomPaginationResponse<Student>>({
      currentPage: '',
      data: []
    });
    this.students$ = this.paginatorRef.pageChanges.pipe(
      switchMap((page) => {
        console.log('pageChanges() - page: ', page);
        const requestFn = (p: string) => this.getStudentsForDate(<string>p);
        return this.paginatorRef.getPage(requestFn);
      }),
      multicast(subject$)
    );
    this.students$.connect();
  }

  getStudentsForDate(dateStr: string) {
    return this.studentDataService.get(dateStr).pipe(
      map((data) => {
        return <CustomPaginationResponse<Student>>{
          currentPage: dateStr,
          data: data
        };
      })
    );
  }

  async findStudents(by: 'sex' | 'name', value: string) {
    let selector = {};
    selector[by] = value;
    const q = { selector };
    const qStr = JSON.stringify(q);
    if (this.queryCache.has(qStr)) {
      return this.studentQuery.selectAll({
        filterBy: (s) => s[by] === value
      });
    } else {
      return from(this.studentDataService.find(q)).pipe(
        tap((res) => this.studentStore.upsertMany(res))
      );
    }
  }

  updateStudent(student: Student) {
    this.studentStore.upsert(student._id, student);
    // todo: if this method was called very frequently, I'd like to have a
    // debounce, making sure it's only called once per second...
    this.studentDataService.upsert(student).catch((err) => {
      console.error(err);
      alert(`Could not update student ${student.name}, reverting...`);
      // @ts-ignore
      this.stateHistory.undo(student._id);
    });
  }

  deleteStudent(_id: ID) {
    const student = this.studentQuery.getEntity(_id);
    this.studentStore.remove(_id);
    this.studentDataService.delete(student).catch((err) => {
      console.error(err);
      alert(`Could not save student ${student.name}, reverting...`);
      if (this.stateHistory.hasPast) {
        // @ts-ignore
        this.stateHistory.undo(student._id);
      }
    });
  }
}
