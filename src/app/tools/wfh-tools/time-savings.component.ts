import { Component, OnInit } from '@angular/core';
import { data } from '../../app.data';
import { AppService } from '../../../app/app.service';
import { FormControl } from '@angular/forms';
import { NumRangePipe } from '../../shared/pipes/num-range.pipe';

@Component({
    selector: 'time-savings',
    templateUrl: './time-savings.component.html',
    providers: [NumRangePipe],
    standalone: false
})
export class TimeSavingsToolComponent implements OnInit{
    data = data.wfhTimeSavingsToolData.data;
    dailyCommuteMinutes = new FormControl();
    commuteDays = new FormControl();
    timeGettingReady = new FormControl();

    savingsInMinutesPerWeek = 0;
    savingsInMinutesPerMonth = 0;
    savingsInMinutesPerYear = 0;
    savingsInHoursPerWeek = 0;
    savingsInHoursPerMonth = 0;
    savingsInHoursPerYear = 0;

    numOfWeeksPerMonth = 4.345;
    numOfWeeksPerYear = 52.1775;

    calculateClicked = false;

    constructor(public appService: AppService, private numRangePipe: NumRangePipe) { }

    ngOnInit(): void {
        this.commuteDays.valueChanges.subscribe(
            v => {
                this.calculateClicked = false;
                this.commuteDays.patchValue(this.numRangePipe.transform(v, 1, 7), {emitEvent: false});
            }
        );
        this.dailyCommuteMinutes.valueChanges.subscribe(
            v => {
                this.calculateClicked = false;
                this.dailyCommuteMinutes.patchValue(this.numRangePipe.transform(v, 1, 1440), {emitEvent: false});
            }
        );
        this.timeGettingReady.valueChanges.subscribe(
            v => {
                this.calculateClicked = false;
                this.timeGettingReady.patchValue(this.numRangePipe.transform(v, -1440, 1440), {emitEvent: false});
            }
        );
    }

    calcSavings(): void {
        if(this.commuteDays.invalid || this.dailyCommuteMinutes.invalid){
            return;
        }
        this.calculateClicked = true;
        this.savingsInMinutesPerWeek = (this.commuteDays.value * this.dailyCommuteMinutes.value) + (this.timeGettingReady.value * this.commuteDays.value);
        this.savingsInMinutesPerMonth = this.savingsInMinutesPerWeek * this.numOfWeeksPerMonth;
        this.savingsInMinutesPerYear = this.savingsInMinutesPerWeek * this.numOfWeeksPerYear;

        const hours = this.savingsInMinutesPerWeek/60;
        this.savingsInHoursPerWeek = hours;
        this.savingsInHoursPerMonth = hours * this.numOfWeeksPerMonth;
        this.savingsInHoursPerYear = hours * this.numOfWeeksPerYear;
    }

    roundNum(num: number){
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

}
