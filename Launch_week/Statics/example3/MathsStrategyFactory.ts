import { MathsStrategy } from "./MathsStrategy";
import { Add } from "./Add";
import { Multiply } from "./Multiply";

export enum MathsStrategyType {
    ADD = "add",
    MULTIPLY = "multiply",
    SUBTRACT = "subtract",
    DIVIDE = "divide",
}

export class MathsStrategyFactory {
    static createStrategy(type: MathsStrategyType): MathsStrategy {
        switch (type) {
            case MathsStrategyType.ADD:
                return new Add();
            case MathsStrategyType.MULTIPLY:
                return new Multiply();
            default:
                throw new Error(`Unknown strategy type: ${type}`);
        }
    }
}