import { UIChart } from 'primeng/chart';
import { Observable } from 'rxjs';

import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ChartComponent implements OnInit {
  @ViewChild(UIChart, { static: true }) uiChart: UIChart;
  @Input() studentsGraphData$: Observable<{
    [key: string]: Array<string | number>;
  }>;
  data: any;

  constructor() {}

  ngOnInit() {
    this.studentsGraphData$.subscribe(
      ({ names, quarterly, halfyearly, annual }) => {
        this.data = {
          labels: names,
          datasets: [
            {
              label: 'Quarterly',
              backgroundColor: '#42A5F5',
              borderColor: '#1E88E5',
              data: quarterly
            },
            {
              label: 'Halfyearly',
              backgroundColor: '#9CCC65',
              borderColor: '#7CB342',
              data: halfyearly
            },
            {
              label: 'Annual',
              backgroundColor: 'red',
              borderColor: 'red',
              data: annual
            }
          ]
        };
        console.log('Chart() - got data: ', this.data);
        this.uiChart.refresh();
      }
    );
  }
}
