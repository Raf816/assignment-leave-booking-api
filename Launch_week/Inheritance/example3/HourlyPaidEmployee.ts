import { Employee } from "./Employee"; 

export class HourlyPaidEmployee extends Employee {
    constructor(name: string, 
                department: string, 
                private readonly hourlyRate: number, 
                private readonly hoursWorked: number) {
        super(name, department);
    }

    calculatePay(): number {
        return this.hourlyRate * this.hoursWorked;
    }

    toString(): string {
        return `${super.toString()} \nHourly rate: £${this.hourlyRate.toFixed(2)} per hour \nHours worked: ${this.hoursWorked}`;
    }
}  