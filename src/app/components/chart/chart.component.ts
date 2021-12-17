import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
})
export class ChartComponent implements OnInit, AfterViewInit {
  @ViewChild('myCanvas', { static: false })
  canvasElement!: ElementRef;

  private chartJS: any;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.chartJS) {
      this.chartJS.destroy();
    }
    this.canvas = this.canvasElement.nativeElement;
    this.ctx = <CanvasRenderingContext2D>this.canvas.getContext('2d');
    this.canvas.oncontextmenu = function (e) {
      e.preventDefault();
      e.stopPropagation();
    };
    const labels = ['', '', '', '', '', '', ''];
    const data = {
      labels: labels,
      datasets: [
        {
          label: 'My First Dataset',
          data: [65, 59, 80, 81, 56, 55, 40],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
    this.chartJS = new Chart(this.ctx, {
      type: 'line',
      data: data,
    });
  }
}
