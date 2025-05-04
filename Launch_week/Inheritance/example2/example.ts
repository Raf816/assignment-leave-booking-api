import { Bicycle } from "./Bicycle"; 
import { MotorVehicle } from "./MotorVehicle"; 

const bicycle1 = new Bicycle('red', true, 21);
console.log(bicycle1.toString());  

const moto1 = new MotorVehicle('blue');
const moto2 = new MotorVehicle('red', 2000);

console.log(moto1.toString());
console.log(moto2.toString()); 