import { Vehicle } from "./Vehicle"; 

export class MotorVehicle extends Vehicle {    
    constructor(colour: string, 
                private readonly engineSize: number = 1000) {
      super(colour);
    }
  
    toString(): string {
      return `colour = ${this.colour}, engine size = ${this.engineSize}`;
    }
}