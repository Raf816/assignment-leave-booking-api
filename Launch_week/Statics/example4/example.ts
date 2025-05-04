import { MathsStrategyFactory, MathsStrategyType } from "./MathsStrategyFactory";

const add = MathsStrategyFactory.createStrategy(MathsStrategyType.ADD);
console.log(`Add: ${add.execute(2, 3)}`);

const multi = MathsStrategyFactory.createStrategy(MathsStrategyType.MULTIPLY);
console.log(`Multiply: ${multi.execute(2, 3)}`);