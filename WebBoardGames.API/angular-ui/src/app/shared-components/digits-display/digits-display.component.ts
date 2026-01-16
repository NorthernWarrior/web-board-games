import { Component, computed, input, signal, effect } from '@angular/core';

@Component({
  selector: 'app-digits-display',
  templateUrl: './digits-display.component.html',
  styleUrls: ['./digits-display.component.scss'],
})
export class DigitsDisplayComponent {
  public readonly value = input<number>(0);
  public readonly minDigits = input<number>(1);
  public readonly postFix = input<string>('');

  // Animation state for each digit
  public digits = signal<Array<{
    idx: number,
    value: string,
    prevValue: string,
    animating: boolean,
    direction: 'up' | 'down' | null
  }>>([]);

  constructor() {
    // Initialize digits with all required properties
    let prevDigits = this.getDigitsArray(this.value()).map(d => ({
      ...d,
      prevValue: d.value,
      animating: false,
      direction: null
    }));
    this.digits.set(prevDigits);

    effect(() => {
      const v = this.value();
      const nextDigits = this.getDigitsArray(v);

      // Animate only changed digits
      const animatedDigits = nextDigits.map((d, i) => {
        const prev = prevDigits[i];
        const prevValue = prev ? prev.value : d.value;
        const animating = prev && prev.value !== d.value;
        let direction: 'up' | 'down' | null = null;
        if (animating) {
          direction = Number(d.value) > Number(prev.value) ? 'up' : 'down';
          if (isNaN(Number(d.value)) || isNaN(Number(prev.value))) direction = 'up';
        }
        return {
          idx: d.idx,
          value: d.value,
          prevValue,
          animating,
          direction
        };
      });

      if (animatedDigits.some(d => d.animating)) {
        this.digits.set(animatedDigits);
        setTimeout(() => {
          // Only update if value hasn't changed again
          if (this.value() === v) {
            const finalDigits = animatedDigits.map(d => ({ ...d, animating: false, prevValue: d.value, direction: null }));
            this.digits.set(finalDigits);
            prevDigits = finalDigits;
          }
        }, 400);
      } else {
        const finalDigits = nextDigits.map(d => ({
          ...d,
          prevValue: d.value,
          animating: false,
          direction: null
        }));
        this.digits.set(finalDigits);
        prevDigits = finalDigits;
      }
    });
  }

  private getDigitsArray(val: number): Array<{idx: number, value: string, prevValue?: string, animating?: boolean, direction?: 'up' | 'down' | null}> {
    const valueString = Math.abs(val).toString();
    const totalDigits = Math.max(this.minDigits(), valueString.length);
    const digits: {idx: number, value: string}[] = [];
    if (val < 0) {
      digits.push({idx: digits.length, value: '-'});
    }
    for (let i = 0; i < totalDigits - valueString.length; i++) {
      digits.push({idx: digits.length, value: '0'});
    }
    for (let i = 0; i < valueString.length; i++) {
      digits.push({idx: digits.length, value: valueString[i]});
    }
    return digits;
  }

  // For template compatibility
  digitsArray = computed(() => this.digits());
}
