import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'numRange',
    standalone: true,
})
export class NumRangePipe implements PipeTransform {
    transform(value: number, min: number, max: number): number | undefined {
        if (Number.isNaN(value) || value === undefined || value === null) {
            return undefined;
        }

        if (value >= max) {
            return max;
        }

        if (value <= min) {
            return min;
        }

        return value;
    }
}
