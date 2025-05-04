const ERROR_MESSAGES = {
    INVALID_FIRST_NAME: "First name must not be blank and be a string",
    INVALID_SURNAME: "Surname must not be blank and be a string",
    STRING_TOO_LONG: "Length of input is too long"
};

export class User {
    private _firstName: string;
    private _surname: string;

    // Accessor
    get firstName(): string {
        return this._firstName;
    }

    get surname(): string {
        return this._surname;
    }

    //Mutator
    set firstName(firstName: string) {
        this._firstName = this.validateAttribute(firstName, ERROR_MESSAGES.INVALID_FIRST_NAME, 20);
    }

    set surname(surname: string) {
        this._surname = this.validateAttribute(surname, ERROR_MESSAGES.INVALID_SURNAME, 20);
    }

    private validateAttribute(value: string, errorMessage: string, max_length: number): string {
        value = value.trim();

        if (typeof value !== "string" || value.length === 0) {
            throw new Error(errorMessage); 
        }

        if (value.length > max_length){
            throw new Error(ERROR_MESSAGES.STRING_TOO_LONG);
        }
       //Add regex here
       return value;
    }

    toString(): string {
        return `${this._firstName} ${this._surname}`;
    }
}              