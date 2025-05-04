import { FullName } from "./FullName";
import { User } from "./User";
import { ValidationError } from "./ValidationError";

try{
    const fullName = new FullName("first1","surname1");
    console.log(fullName.toString());
    
    const user = new User(fullName, "username1", "password1");
    console.log(user.toString());
}
catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Validation error ${error.message}`);
    } else {
      console.error('Unexpected error');
    }
}