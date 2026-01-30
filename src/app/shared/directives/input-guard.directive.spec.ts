import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { InputGuardDirective } from './input-guard.directive';

type GuardConfig = {
  allowedChar?: RegExp;
  sanitize?: (s: string) => string;
  allowSpaces?: boolean;
};

@Component({
  standalone: true,
  imports: [InputGuardDirective],
  template: ` <input [appInputGuard]="config" [guardMode]="guardMode" /> `,
})
class HostComponent {
  guardMode: 'block' | 'sanitize' = 'block';

  config: GuardConfig = {
    allowedChar: /[0-9]/,
    sanitize: (s: string) => s.replace(/[^0-9]/g, ''),
    allowSpaces: false,
  };
}

describe('InputGuardDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();
  });

  function getInput(fixture: ComponentFixture<HostComponent>): HTMLInputElement {
    return fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
  }

  it('keydown: should preventDefault when key is not allowed (block mode)', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input = getInput(fixture);

    const e = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    const prevent = vi.spyOn(e, 'preventDefault');

    input.dispatchEvent(e);

    expect(prevent).toHaveBeenCalled();
  });

  it('keydown: should allow digits and allow control keys', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input = getInput(fixture);

    const e1 = new KeyboardEvent('keydown', { key: '5', bubbles: true });
    const p1 = vi.spyOn(e1, 'preventDefault');
    input.dispatchEvent(e1);
    expect(p1).not.toHaveBeenCalled();

    const e2 = new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true });
    const p2 = vi.spyOn(e2, 'preventDefault');
    input.dispatchEvent(e2);
    expect(p2).not.toHaveBeenCalled();
  });

  it('paste: should sanitize clipboard text and preventDefault when changes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input = getInput(fixture);
    input.value = '12';
    input.setSelectionRange(2, 2);

    const e = new Event('paste', { bubbles: true }) as ClipboardEvent;
    Object.defineProperty(e, 'clipboardData', {
      value: { getData: () => 'a3b' },
    });

    const prevent = vi.spyOn(e, 'preventDefault');

    input.dispatchEvent(e);

    expect(prevent).toHaveBeenCalled();
    expect(input.value).toBe('123');
  });

  it('input: in sanitize mode should sanitize current value', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.guardMode = 'sanitize';
    fixture.detectChanges();

    const input = getInput(fixture);

    input.value = 'a1b2';
    input.setSelectionRange(4, 4);

    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(input.value).toBe('12');
  });

  it('beforeinput: should prevent invalid insertion and apply sanitized value', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input = getInput(fixture);
    input.value = '12';
    input.setSelectionRange(2, 2);

    const e = new Event('beforeinput', { bubbles: true }) as Event & { data?: string };
    e.data = 'a3';

    const prevent = vi.spyOn(e, 'preventDefault');

    input.dispatchEvent(e as unknown as InputEvent);

    expect(prevent).toHaveBeenCalled();
    expect(input.value).toBe('123');
  });

  it('drop: should sanitize dropped text and preventDefault when changes', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const input = getInput(fixture);
    input.value = '9';
    input.setSelectionRange(1, 1);

    const e = new Event('drop', { bubbles: true }) as Event & {
      dataTransfer?: { getData: (t: string) => string };
    };

    e.dataTransfer = { getData: () => 'a8b' };

    const prevent = vi.spyOn(e, 'preventDefault');

    input.dispatchEvent(e as unknown as DragEvent);

    expect(prevent).toHaveBeenCalled();
    expect(input.value).toBe('98');
  });
});
