import { ERROR_MESSAGES } from "./errorMessages"; 
import { Validator } from "./Validator";

const USER_FIELDS  = {
    FIRST_NAME: "first name",
    SURNAME: "surname"
};
export class User extends Validator {
    constructor(readonly firstName: string, 
                readonly surname: string) {
        super();
        this.validate(firstName, surname);
    }

    private validate(firstName: string, 
                     surname: string): void {
        
        this.isNull(firstName, USER_FIELDS.FIRST_NAME, ERROR_MESSAGES.NULL_VALUE);
        this.isBlank(firstName, USER_FIELDS.FIRST_NAME, ERROR_MESSAGES.BLANK_VALUE);
        this.isTooLong(firstName, USER_FIELDS.FIRST_NAME, ERROR_MESSAGES.STRING_TOO_LONG, 30);

        this.isNull(surname, USER_FIELDS.SURNAME, ERROR_MESSAGES.NULL_VALUE);
        this.isBlank(surname, USER_FIELDS.SURNAME, ERROR_MESSAGES.BLANK_VALUE);
        this.isTooLong(surname, USER_FIELDS.SURNAME, ERROR_MESSAGES.STRING_TOO_LONG, 30);
    }


    toString(): string {
        return `${this.firstName} ${this.surname}`;
    }
}              