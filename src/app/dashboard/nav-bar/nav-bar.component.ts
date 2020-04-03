import { CustomPaginatorPlugin } from 'src/app/paginator/customPaginator';

import { Component, Inject, OnInit } from '@angular/core';

import { LoginService } from '../../login/login.service';
import { SessionQuery } from '../../login/state/index';
import { Student, StudentService } from '../state';
import { STUDENT_PAGINATOR } from '../state/student.paginator';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {
  constructor(
    @Inject(STUDENT_PAGINATOR)
    public paginatorRef: CustomPaginatorPlugin<Student>,
    private loginService: LoginService,
    public sessionQuery: SessionQuery
  ) {}

  ngOnInit() {}

  logout() {
    if (confirm('Are you sure to log out?')) {
      this.loginService.logout();
    }
  }
}
