import { MathsStrategy } from "./MathsStrategy";

export class Multiply implements MathsStrategy {
    calculate(num1: number, 
            num2: number): 
            number {
        return num1 * num2;
    }
}