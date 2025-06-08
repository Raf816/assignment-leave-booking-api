import { validate } from "class-validator";
import { AppError } from "./AppError";

export class ValidationUtil {
  static async validateOrThrow(entity: any): Promise<void> {
    const errors = await validate(entity);
    if (errors.length > 0) {
      const errorMessages = errors
        .map(err => Object.values(err.constraints || {}))
        .flat()
        .join(", ");
      throw new AppError(errorMessages);
    }
  }
}
