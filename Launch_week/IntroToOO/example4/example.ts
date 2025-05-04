import { ValidationError } from "./ValidationError"; 

function performOperation() {
    throw new ValidationError('Something went wrong');
  }
  
  try {
    performOperation();
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Custom Error: ${error}`); //same as error.message
      //console.error(`Custom Error: ${error.stack}`);
    } else {
      console.error('An unexpected error occurred');
    }
  }

//https://www.webdevtutor.net/blog/typescript-error-custom