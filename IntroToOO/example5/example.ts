import { User } from "./User"; 
import { ValidationError } from "./ValidationError";

try{
    const user = new User("first1","surname1");

    console.log(user.toString());
}
catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Validation error ${error.message}`);
    } else {
      console.error('Unexpected error');
    }
}