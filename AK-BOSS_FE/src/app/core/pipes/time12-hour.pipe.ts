import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'time12Hour',standalone: true})
export class Time12HourPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Parse "HH:mm:ss" string
    const [hourStr, minute, second] = value.split(':');
    let hour = +hourStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12 || 12; // 0 -> 12 for 12 AM/PM

    return `${hour}:${minute} ${ampm}`;
  }
}
