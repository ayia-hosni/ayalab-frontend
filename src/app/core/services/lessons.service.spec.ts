import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LessonsService } from './lessons.service';

describe('LessonsService', () => {
  let service: LessonsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(LessonsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('asks the server for the list in the active language', () => {
    let result: unknown;
    service.list('ar').subscribe(r => (result = r));
    const req = http.expectOne(r => r.url.endsWith('/lessons'));
    expect(req.request.params.get('lang')).toBe('ar');
    req.flush([{ slug: 'x' }]);
    expect(result).toEqual([{ slug: 'x' }]);
  });

  it('requests a lesson by slug or legacy numeric id, escaping the path segment', () => {
    service.get('tree basics/../1', 'en').subscribe();
    const req = http.expectOne(r => r.url.includes('/lessons/'));
    expect(req.request.url.endsWith('/lessons/tree%20basics%2F..%2F1')).toBe(true);
    expect(req.request.params.get('lang')).toBe('en');
    req.flush({});
  });
});
