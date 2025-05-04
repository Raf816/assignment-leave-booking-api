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
        this._firstName = firstName;
    }

    set surname(surname: string) {
        this._surname = surname;
    }

    toString(): string {
        return `${this._firstName} ${this._surname}`;
    }
}              