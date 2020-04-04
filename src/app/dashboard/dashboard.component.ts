import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ID } from '@datorama/akita';

import {
  createStudent,
  Student,
  StudentQuery,
  StudentService
} from './state/index';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  formData: Student;
  students$: Observable<Array<Student>>;
  studentsGraphData$: Observable<{ [key: string]: Array<string | number> }>;

  constructor(
    private studentService: StudentService,
    public studentQuery: StudentQuery
  ) {}

  ngOnInit() {
    // if I don't subscribe to this, no page changes have effect!
    this.studentService.students$.subscribe((r) =>
      console.log('dashboard() - got: ', r)
    );
    // this.students$ = this.studentQuery.selectAll(); // before. but now just want current page.
    this.students$ = this.studentService.students$.pipe(map((r) => r.data));
    this.studentsGraphData$ = this.students$.pipe(
      map(this.studentQuery.getStudentGraphData)
    );
  }

  onAdd() {
    this.nullifyFormData();
    setTimeout(() => (this.formData = createStudent({})));
  }
  onEdit(_id: ID) {
    this.nullifyFormData();
    setTimeout(() => (this.formData = this.studentQuery.getEntity(_id)));
  }

  onDelete(_id: ID) {
    this.nullifyFormData();
    if (confirm('Are you sure to delete?')) {
      this.studentService.deleteStudent(_id);
    }
  }

  updateformData(student: Student) {
    this.studentService.updateStudent(student);
    this.nullifyFormData();
  }

  nullifyFormData() {
    this.formData = null;
  }
}
