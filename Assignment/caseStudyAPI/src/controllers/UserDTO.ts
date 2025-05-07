import { Role } from "../entity/Role"; 

export class UserDTO {    
  constructor(
    private id: number,
    private email: string,
    private role: Role
  ) {}
}
