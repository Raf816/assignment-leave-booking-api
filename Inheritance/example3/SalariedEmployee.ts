import { Employee } from "./Employee"; 

const WEEKS_IN_YEAR = 52;
export class SalariedEmployee extends Employee {
    constructor(name: string, 
                department: string, 
                readonly yearlySalary: number) {
        super(name, department);
    }

    calculatePay(): number {
        return this.yearlySalary / WEEKS_IN_YEAR;
    }

    toString(): string {
        return `${super.toString()} \nYearly salary: £${this.yearlySalary.toFixed(2)}`;
    }
}  