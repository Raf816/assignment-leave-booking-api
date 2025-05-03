import { FullName } from "./FullName"; 
import { ValidationError } from "./ValidationError";
import { ERROR_MESSAGES } from "./errorMessages"; 

export class User {
    constructor(private readonly fullName: FullName, 
                private readonly username: string, 
                private readonly password: string) {
        this.username = this.validateAttribute(username, ERROR_MESSAGES.INVALID_USERNAME, 20);
        this.password = this.validateAttribute(password, ERROR_MESSAGES.INVALID_PASSWORD, 30);
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
        return `${this.fullName.firstName} ${this.fullName.surname}`;
    }
}