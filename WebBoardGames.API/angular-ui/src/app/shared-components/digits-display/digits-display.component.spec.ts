import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DigitsDisplayComponent } from './digits-display.component';
import { SharedComponentsModule } from '../shared-components.module';

describe('DigitsDisplayComponent', () => {
  let component: DigitsDisplayComponent;
  let fixture: ComponentFixture<DigitsDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedComponentsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(DigitsDisplayComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default value of 0', () => {
    fixture.detectChanges();
    expect(component.value()).toBe(0);
  });

  it('should display positive numbers correctly', () => {
    fixture.componentRef.setInput('value', 123);
    fixture.detectChanges();
    expect(component.value()).toBe(123);
  });

  it('should display negative numbers correctly', () => {
    fixture.componentRef.setInput('value', -456);
    fixture.detectChanges();
    expect(component.value()).toBe(-456);
  });

  it('should respect minDigits parameter', () => {
    fixture.componentRef.setInput('value', 5);
    fixture.componentRef.setInput('minDigits', 4);
    fixture.detectChanges();
    const digits = component.digits();
    expect(digits.length).toBe(4);
  });

  it('should have postFix parameter', () => {
    fixture.componentRef.setInput('postFix', '$');
    fixture.detectChanges();
    expect(component.postFix()).toBe('$');
  });

  it('should initialize digits array', () => {
    fixture.detectChanges();
    const digits = component.digits();
    expect(digits).toBeDefined();
    expect(Array.isArray(digits)).toBe(true);
  });
});
