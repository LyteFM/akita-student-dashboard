import { Observable } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ID } from '@datorama/akita';

import { createStudent, Student, StudentQuery, StudentService } from './state/index';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  formData: Student;
  students$: Observable<Array<Student>>;

  constructor(
    private studentService: StudentService,
    public studentQuery: StudentQuery
  ) {}

  ngOnInit() {
    // if I don't subscribe to this, no page changes have effect!
    this.studentService.students$.subscribe((r) =>
      console.log('dashboard() - got: ', r)
    );
    // todo: this still displays _all_ available students. But just want the current page!!!
    this.students$ = this.studentQuery.selectAll();
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
