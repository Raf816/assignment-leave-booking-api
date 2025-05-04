import { MathsStrategyFactory, MathsStrategyType } from "./MathsStrategyFactory";

const addStrategy = MathsStrategyFactory.createStrategy(MathsStrategyType.ADD);

console.log(`Add: ${addStrategy.calculate(2, 3)}`);
console.log(`Add: ${addStrategy.calculate(4, 5)}`);

const multiplyStrategy = MathsStrategyFactory.createStrategy(MathsStrategyType.MULTIPLY);
console.log(`Multiply: ${multiplyStrategy.calculate(2, 3)}`);
console.log(`Multiply: ${multiplyStrategy.calculate(4, 5)}`);