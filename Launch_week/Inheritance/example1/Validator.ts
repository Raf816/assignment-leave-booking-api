import { ValidationError } from "./ValidationError";

export abstract class Validator {
    isNull(value: any, 
           fieldName: string,
            errorMessage: string): void {
        if (value === null) {
            throw new ValidationError(`${fieldName} ${errorMessage}`); 
        }
    }

    isBlank(value: string, 
            fieldName: string,
            errorMessage: string): void {
        value = value.trim();
        if (typeof value !== "string" 
            || value.length === 0) {
            throw new ValidationError(`${fieldName} ${errorMessage}`); 
        }
    }

    isTooLong(value: string, 
              fieldName: string,
              errorMessage: string, 
              max_length: number): void{    
        if (value.length > max_length){
            throw new ValidationError(`${fieldName} ${errorMessage}`); 
        }
    }
}