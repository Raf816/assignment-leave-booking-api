import { validate } from 'class-validator';
import { Role } from './Role';

describe('Role entity tests', () => { 
    it('A blank name is considered invalid', async () => {
        const invalidRole = new Role();
        invalidRole.name = ''; //IsNotEmpty captures "", null and undefined

        const errors = await validate(invalidRole);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('A name containing only spaces is considered invalid', async () => {
        const invalidRole = new Role();
        invalidRole.name = '   '; 
    
        const errors = await validate(invalidRole);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.matches).toBeDefined();
    });

    it('A name exceeding 30 characters is considered invalid', async () => {
        const invalidRole = new Role();
        invalidRole.name = 'a'.repeat(31); 

        const errors = await validate(invalidRole);

        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints?.maxLength).toBeDefined();
    });

    it('A valid name will be accepted', async () => {
        const role = new Role();
        role.name = 'manager'; 

        const errors = await validate(role);

        expect(errors.length).toBe(0);
    });
});