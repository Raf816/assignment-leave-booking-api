import { HourlyPaidEmployee } from "./HourlyPaidEmployee"; 
import { SalariedEmployee } from "./SalariedEmployee"; 

const hourlyPaidEmp = new HourlyPaidEmployee("Fred Bloggs", "Sales", 7.5, 30);
console.log("\nHourly Paid Employee\n" + hourlyPaidEmp);
console.log(`Pay per week: £${hourlyPaidEmp.calculatePay().toFixed(2)}`);

const salariedEmp = new SalariedEmployee("Jenny Jones", "Finance", 22000);
console.log("\nSalaried Employee\n" + salariedEmp);
console.log(`Pay per week: £${salariedEmp.calculatePay().toFixed(2)}`);