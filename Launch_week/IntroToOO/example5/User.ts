import { ERROR_MESSAGES } from "./errorMessages"; 
import { ValidationError } from "./ValidationError";

export class User {
    constructor(private readonly firstName: string, 
                private readonly surname: string) {
        this.firstName = this.validateAttribute(firstName, ERROR_MESSAGES.INVALID_FIRST_NAME, 20);
        this.surname = this.validateAttribute(surname, ERROR_MESSAGES.INVALID_SURNAME, 20);
    }

    private validateAttribute(value: string, 
                            errorMessage: string, 
                            max_length: number): string {
        value = value.trim();

        if (typeof value !== "string" 
            || value.length === 0) {
            throw new ValidationError(errorMessage); 
        }

        if (value.length > max_length){
            throw new ValidationError(ERROR_MESSAGES.STRING_TOO_LONG);
        }
       //Add regex here
       return value;
    }

    toString(): string {
        return `${this.firstName} ${this.surname}`;
    }
}              