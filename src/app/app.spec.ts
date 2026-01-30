import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should mount without crashing', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // Assert mínimo: el root existe y no rompe en render
    expect(fixture.nativeElement).toBeTruthy();
  });
});
