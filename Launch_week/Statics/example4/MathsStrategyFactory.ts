import { Add } from "./Add";
import { Multiply } from "./Multiply";
import { PerformCalculation } from "./PerformCalculation";

export enum MathsStrategyType { 
    ADD = "add",
    MULTIPLY = "multiply",
    SUBTRACT = "subtract",
    DIVIDE = "divide",
}

export class MathsStrategyFactory { 
    static createStrategy(type: MathsStrategyType): PerformCalculation {
        switch (type) {
            case MathsStrategyType.ADD:
                return new PerformCalculation(new Add());
            case MathsStrategyType.MULTIPLY:
                return new PerformCalculation(new Multiply());
            default:
                throw new Error(`Unknown strategy type: ${type}`);
        }
    }
}