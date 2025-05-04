import { User } from "./User"; 

try{
    const user = new User;
    user.firstName = "firstname1";
    user.surname = "surname1";
    
    console.log(user.toString());
}
catch (error) {
    console.error(`Validation error ${error.message}`);
}