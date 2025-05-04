import { User } from "./User";

const user1 = User.UserNoFirstName("surname1");
console.log(user1.toString());
const user2 = User.UserNoSurname("firstname1");
console.log(user2.toString());

