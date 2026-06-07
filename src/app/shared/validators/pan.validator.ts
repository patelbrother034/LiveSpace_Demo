import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function panValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    // PAN format: 10-character alphanumeric (e.g. ABCDE1234F)
    const clean = String(control.value).trim().toUpperCase();
    
    const isValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean);
    
    return isValid ? null : { invalidPan: { value: control.value } };
  };
}
