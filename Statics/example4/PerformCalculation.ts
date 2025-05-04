import { MathsStrategy } from "./MathsStrategy";

export class PerformCalculation {   
    constructor(private readonly strategy: MathsStrategy) {
        this.strategy = strategy;
    }

    execute(num1: number, 
            num2: number): 
            number{
        return this.strategy.calculate(num1, num2);
    }
}