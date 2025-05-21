import { Request, Response } from 'express';
import { AppDataSource } from '../data-source'; 
import { Role } from '../entity/Role';
import { Repository } from "typeorm";
import { StatusCodes } from 'http-status-codes';
import { ResponseHandler } from '../helper/ResponseHandler';
import { validate } from "class-validator";
import { IEntityController } from './IEntityController';
import { AppError } from "../helper/AppError";

export class RoleController implements IEntityController{
    public static readonly ERROR_NO_ID_PROVIDED = "No ID provided";
    public static readonly ERROR_INVALID_ID_FORMAT = "Invalid ID format";
    public static readonly ERROR_ROLE_NOT_FOUND = "Role not found";
    public static readonly ERROR_ROLE_NOT_FOUND_WITH_ID = (id: number) => `Role not found with ID: ${id}`;
    public static readonly ERROR_NAME_IS_BLANK = "Name is blank";
    public static readonly ERROR_FAILED_TO_RETRIEVE_ROLES = "Failed to retrieve roles";
    public static readonly ERROR_FAILED_TO_RETRIEVE_ROLE = "Failed to retrieve role";
    public static readonly ERROR_ROLE_NOT_FOUND_FOR_DELETION = "Role with the provided ID not found";

    private roleRepository: Repository<Role>;
    constructor() {
        this.roleRepository = AppDataSource.getRepository(Role);
    }

  // Get all roles
    public getAll = async (req: Request, res: Response): Promise<void> =>{
        const roles = await this.roleRepository.find();

        if (roles.length === 0) {
            ResponseHandler.sendErrorResponse(res,
                                                StatusCodes.NO_CONTENT);  
            return;
        }

        ResponseHandler.sendSuccessResponse(res, roles);  
    };

   // Get role by ID
    public getById = async (req: Request, res: Response): Promise<void> => {    
        const id = parseInt(req.params.id);
            
        if (isNaN(id)) {
            ResponseHandler.sendErrorResponse(res, 
                                                StatusCodes.BAD_REQUEST, 
                                                RoleController.ERROR_INVALID_ID_FORMAT);
            return;
        }
    
            const role = await this.roleRepository.findOne({ where: { id: id }});
            if (!role) {
                ResponseHandler.sendErrorResponse(res, 
                                                    StatusCodes.NOT_FOUND, 
                                                    RoleController.ERROR_ROLE_NOT_FOUND_WITH_ID(id));
                return;
            }
            
        ResponseHandler.sendSuccessResponse(res, role);                
    };

    // Add a new role
    public create = async (req: Request, res: Response): Promise<void> => {
        let role = new Role();
        role.name = req.body.name;
        const errors = await validate(role);

        if (errors.length > 0) {
            throw new AppError (errors.map(err => Object.values(err.constraints || {})).join(", "));
        } 
        
        role = await this.roleRepository.save(role); // Save and return the created object
    
        ResponseHandler.sendSuccessResponse(res, 
                                            role, 
                                            StatusCodes.CREATED);  
    };

    // Delete a role
    public delete = async (req: Request, res: Response): Promise<void> => {
        const id = req.params.id;
    
        if (!id) {
            throw new Error(RoleController.ERROR_NO_ID_PROVIDED);
        }

        const result = await this.roleRepository.delete(id);

        if (result.affected === 0) {
            throw new AppError(RoleController.ERROR_ROLE_NOT_FOUND_FOR_DELETION);
        }

        ResponseHandler.sendSuccessResponse(res, "Role deleted"); 
    };

    
    // Update a role
    public update = async (req: Request, res: Response): Promise<void> => {
        const id = req.body.id;
    
        if (!id) {
            throw new AppError(RoleController.ERROR_NO_ID_PROVIDED);
        }
        
        let role = await this.roleRepository.findOneBy({ id });
        
        if (!role) {
            throw new AppError(RoleController.ERROR_ROLE_NOT_FOUND);
        }

        //Update fields
        role.name = req.body.name;

        const errors = await validate(role);
        if (errors.length > 0) {
            throw new AppError (errors.map(err => Object.values(err.constraints || {})).join(", "));
        }
        
        role = await this.roleRepository.save(role);
        
        ResponseHandler.sendSuccessResponse(res, 
                                            role); 
    };
}