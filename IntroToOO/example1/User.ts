export class User {
    firstName: string;
    surname: string;

    toString(): string {
        return `${this.firstName} ${this.surname}`;
    }
}
//