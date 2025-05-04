import { Vehicle } from "./Vehicle"; 

export class Bicycle extends Vehicle {  
    constructor(colour: string, 
                private readonly bell: boolean, 
                private readonly numberOfGears: number) {
      super(colour);
    }

    toString(): string {
      return `bell = ${this.bell}, gears = ${this.numberOfGears}, colour = ${this.colour}`;
    }
  }  