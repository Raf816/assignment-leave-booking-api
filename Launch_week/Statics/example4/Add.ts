import { MathsStrategy } from "./MathsStrategy";

export class Add implements MathsStrategy {
    calculate(num1: number, 
              num2: number): number {
        return num1 + num2;
    }
}