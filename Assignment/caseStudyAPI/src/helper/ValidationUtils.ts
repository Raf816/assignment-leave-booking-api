import { validate } from "class-validator";
import { AppError } from "./AppError";


 //handle validation logic using class-validator.
 //entity with decorators like @IsNotEmpty, @IsEmail, etc. is validated before being used
export class ValidationUtil {
   //Validates the entity using class-validator.
   //If any validation errors are found, it throws an AppError with a error message.
  static async validateOrThrow(entity: any, groups: string[] = []): Promise<void> {
    const errors = await validate(entity, { groups, skipMissingProperies: false, });
    if (errors.length > 0) {
      const errorMessages = errors
        .map(err => Object.values(err.constraints || {}))
        .flat()
        .join(", ");

      throw new AppError(errorMessages);
    }
  }
}
