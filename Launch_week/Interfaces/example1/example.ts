import { Add } from "./Add";
import { Multiply } from "./Multiply";

const addStrategy = new Add();
console.log(`Add: ${addStrategy.calculate(2, 3)}`);
console.log(`Add: ${addStrategy.calculate(4, 5)}`);

const multiplyStrategy = new Multiply();
console.log(`Multiply: ${multiplyStrategy.calculate(2, 3)}`);
console.log(`Multiply: ${multiplyStrategy.calculate(4, 5)}`);