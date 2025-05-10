import request from 'supertest';
import express, { Router } from 'express';
import { RoleRouter } from './RoleRouter';
import { RoleController } from '../controllers/RoleController';
import { StatusCodes } from 'http-status-codes';

//https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status#successful_responses
const mockRoleController = {
    delete: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
    getAll: jest.fn((req, res) => res.status(StatusCodes.OK).json([])),
    getById: jest.fn((req, res) => res.status(StatusCodes.OK).json({ id: req.params.id })),
    create: jest.fn((req, res) => res.status(StatusCodes.CREATED).json(req.body)),
    update: jest.fn((req, res) => res.status(StatusCodes.OK).json(req.body))
} as unknown as RoleController;

//spy on real router (rather than mock it)
const router = Router();
jest.spyOn(router, 'get');
jest.spyOn(router, 'post');
jest.spyOn(router, 'patch');//No put in router/controller
jest.spyOn(router, 'delete');
jest.spyOn(router, 'use');

const app = express();
app.use(express.json());

const roleRouter = new RoleRouter(router, mockRoleController);
app.use('/roles', roleRouter.getRouter());

const BASE_ROLES_URL = '/roles';

describe('RoleRouter', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('getAll on GET /roles can be called', async () => {
        const response = await request(app).get(BASE_ROLES_URL);
        
        expect(mockRoleController.getAll).toHaveBeenCalled()
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual([]); 
    });

    it('getById route GET /roles/:id can be called', async () => {
        const id = "1";
        const endPoint =`${BASE_ROLES_URL}/${id}`;

        const response = await request(app).get(endPoint);
       
        let requestedUrl = (mockRoleController.getById as jest.Mock).mock.calls[0][0].originalUrl;
    
        expect(requestedUrl).toBeDefined();
        expect(requestedUrl).toBe(endPoint);
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual({ id });
    });

    it('create route POST /roles can be called', async () => {
        const newRoleData = { name: 'manager' };

        const response = await request(app).post(BASE_ROLES_URL).send(newRoleData);

        let body = (mockRoleController.create as jest.Mock).mock.calls[0][0].body;
        expect(body).toBeDefined();
        expect(mockRoleController.create).toHaveBeenCalled();
        expect(body).toStrictEqual(newRoleData);
        expect(response.status).toBe(StatusCodes.CREATED);
    });

    it('update route PATCH /roles can be called', async () => {
        const updateRoleData = { id: 1, name: 'Updated Role' };

        const response = await request(app).patch(BASE_ROLES_URL).send(updateRoleData);

        let body = (mockRoleController.update as jest.Mock).mock.calls[0][0].body;
        expect(body).toBeDefined();
        expect(body).toStrictEqual(updateRoleData);
        expect(mockRoleController.update).toHaveBeenCalled();
        expect(response.status).toBe(StatusCodes.OK);
    });

    it('delete route DELETE /roles/:id can be called', async () => {
        const id = "1";
        const endPoint =`${BASE_ROLES_URL}/${id}`;

        const response = await request(app).delete(endPoint);
    
        let url = (mockRoleController.delete as jest.Mock).mock.calls[0][0].originalUrl;
        expect(url).toBeDefined();
        expect(mockRoleController.delete).toHaveBeenCalled();
        expect(url).toBe(endPoint);
        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toEqual({ id });
    });
});