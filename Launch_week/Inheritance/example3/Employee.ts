export abstract class Employee {  
    constructor(protected readonly name: string, 
                protected readonly department: string) {}
  
    abstract calculatePay(): number;
  
    toString(): string {
      return `Name: ${this.name} \nDepartment: ${this.department}`;
    }
}