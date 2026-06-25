import {
  Component, OnInit, OnDestroy, AfterViewInit,
  signal, computed, inject,
  ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';
import {
  DashboardStats, PaymentLogEntry, Period, TimelinePoint,
} from '../../core/models/dashboard.models';

Chart.register(...registerables);

const METHOD_COLORS: Record<string, string> = {
  CARD:   '#A55EEA',
  WALLET: '#FF9F43',
  KIOSK:  '#1DD1A1',
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  private svc = inject(DashboardService);

  @ViewChild('lineCanvas') lineCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutCanvas') doughnutCanvas!: ElementRef<HTMLCanvasElement>;

  private lineChart?: Chart;
  private doughnutChart?: Chart;

  period = signal<Period>('week');
  stats = signal<DashboardStats | null>(null);
  logs = signal<PaymentLogEntry[]>([]);
  loading = signal(true);
  logsLoading = signal(true);
  logPage = signal(0);
  logTotalPages = signal(0);
  eventTypeFilter = '';

  readonly periods: { value: Period; label: string }[] = [
    { value: 'day',   label: '24h' },
    { value: 'week',  label: '7d'  },
    { value: 'month', label: '30d' },
  ];

  readonly EVENT_TYPES = [
    'PAYMENT_INITIATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED',
    'WEBHOOK_RECEIVED', 'WEBHOOK_VERIFIED', 'WEBHOOK_REJECTED',
    'PAYMOB_AUTH_SUCCESS', 'PAYMOB_AUTH_FAILED',
    'ORDER_REGISTERED', 'PAYMENT_KEY_GENERATED', 'METHOD_EXECUTED',
  ];

  readonly egp = (cents: number) => `EGP ${(cents / 100).toFixed(2)}`;

  chartsReady = false;

  ngOnInit(): void {
    this.loadStats();
    this.loadLogs();
  }

  ngAfterViewInit(): void {
    this.chartsReady = true;
    if (this.stats()) this.renderCharts(this.stats()!);
  }

  ngOnDestroy(): void {
    this.lineChart?.destroy();
    this.doughnutChart?.destroy();
  }

  setPeriod(p: Period): void {
    this.period.set(p);
    this.loadStats();
  }

  loadStats(): void {
    this.loading.set(true);
    this.svc.stats(this.period()).subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
        if (this.chartsReady) this.renderCharts(s);
      },
      error: () => this.loading.set(false),
    });
  }

  loadLogs(page = 0): void {
    this.logsLoading.set(true);
    this.logPage.set(page);
    this.svc.logs(page, 15, this.eventTypeFilter || undefined).subscribe({
      next: (r) => {
        this.logs.set(r.content);
        this.logTotalPages.set(r.totalPages);
        this.logsLoading.set(false);
      },
      error: () => this.logsLoading.set(false),
    });
  }

  applyFilter(): void {
    this.loadLogs(0);
  }

  private renderCharts(s: DashboardStats): void {
    this.renderLine(s.timeline);
    this.renderDoughnut(s.byMethod);
  }

  private renderLine(timeline: TimelinePoint[]): void {
    this.lineChart?.destroy();
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: timeline.map(p => p.ts),
        datasets: [
          {
            label: 'Initiated',
            data: timeline.map(p => p.initiated),
            borderColor: '#FF9F43',
            backgroundColor: 'rgba(255,159,67,0.12)',
            borderWidth: 3,
            pointRadius: 4,
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Completed',
            data: timeline.map(p => p.completed),
            borderColor: '#1DD1A1',
            backgroundColor: 'rgba(29,209,161,0.12)',
            borderWidth: 3,
            pointRadius: 4,
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } },
          x: { ticks: { maxTicksLimit: 10 } },
        },
      },
    });
  }

  private renderDoughnut(byMethod: Record<string, number>): void {
    this.doughnutChart?.destroy();
    const labels = Object.keys(byMethod);
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: labels.map(k => byMethod[k]),
          backgroundColor: labels.map(k => METHOD_COLORS[k] ?? '#B2BEC3'),
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' },
        },
        cutout: '65%',
      },
    });
  }

  eventBadgeClass(type: string): string {
    if (type.includes('COMPLETED') || type.includes('VERIFIED') || type.includes('AUTH_SUCCESS')) return 'badge-success';
    if (type.includes('FAILED') || type.includes('REJECTED')) return 'badge-error';
    if (type.includes('RECEIVED') || type.includes('INITIATED')) return 'badge-info';
    return 'badge-neutral';
  }
}
