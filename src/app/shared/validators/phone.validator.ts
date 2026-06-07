import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    // Matches standard Indian phone numbers (+91-9876543210, +91 9876543210, 9876543210)
    const clean = String(control.value).replace(/[\s-]/g, '');
    
    const isValid = /^(\+91|91)?[6-9]\d{9}$/.test(clean);
    
    return isValid ? null : { invalidPhone: { value: control.value } };
  };
}
