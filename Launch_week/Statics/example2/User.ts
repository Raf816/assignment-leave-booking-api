export class User {
    private static _count: number = 0;

    constructor(private readonly firstName: string, 
                private readonly surname: string) {
        //Validation removed from this example

        //Keep a count of every object created
        User._count++;
    }

    static get count() : number {
        return User._count;
    }

    toString(): string {
        return `${this.firstName} ${this.surname}`;
    }
}              