export class User {
    readonly firstName: string;
    readonly surname: string;

    private constructor(firstName: string, 
                surname: string) {
        //Validation removed from this example
        this.firstName = firstName;
        this.surname = surname;
    }

    //Factory methods for a class to allow for situations with the same method signature
    static UserNoFirstName(surname: string): User {
        return new User("default-first", surname);
    }

    static UserNoSurname(firstName: string): User {
        return new User("a","default-surname");
    }

    toString(): string {
        return `${this.firstName} ${this.surname}`;
    }
}              