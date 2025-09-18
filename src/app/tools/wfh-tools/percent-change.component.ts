import { Component, OnInit } from '@angular/core';
import { data } from '../../app.data';
import { FormControl, Validators } from '@angular/forms';
import { AppService } from '../../app.service';

@Component({
    selector: 'percent-change',
    templateUrl: './percent-change.component.html',
    styleUrls: ['../tools.component.css'],
})
export class PercentChangeToolComponent implements OnInit {
    data = data.percentChangeToolData.data;
    xNumber = new FormControl<number | null>(null, [Validators.max(9999999999999), Validators.min(-9999999999999)]);
    yNumber = new FormControl<number | null>(null, [Validators.max(9999999999999), Validators.min(-9999999999999)]);
    increaseNumber = 0;
    constructor(public appService: AppService) { }

    calcPercentIncrease(newValue: number, originalValue: number): void {
        if(this.xNumber.invalid || this.yNumber.invalid){
            this.increaseNumber = 0;
            return;
        }
        this.increaseNumber = ((newValue - originalValue) / Math.abs(originalValue)) * 100;
    }

    calcPercentDecrease(newValue: number, originalValue: number): void {
        this.increaseNumber = ((newValue - originalValue) / Math.abs(originalValue)) * 100;
    }

    roundNum(num: number){
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    ngOnInit(): void {
    }

}

// Percent increase = [(new value – original value)/original value] * 100 &
// Percent decrease = [(original value – new value)/original value] * 100