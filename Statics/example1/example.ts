import { Calculator} from './Calculator';

const sumOf = Calculator.addTwoInts(3, 5);
const productOf = Calculator.multiplyTwoInts(4, 6);

console.log(`3 + 5 = ${sumOf}`); 
console.log(`4 x 6 = ${productOf}`); 

console.log(`4 x 6 = ${Calculator.addTwoInts(4, 6)}`); 