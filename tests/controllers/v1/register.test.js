import request from 'supertest';
import TestsHelpers from '../../test-helpers';
import models from '../../../src/models';

describe('register', () => {
    let app;

    beforeAll(async () => {
        await TestsHelpers.startDb();
        app = TestsHelpers.getApp();
    });

    afterAll(async () => {
        await TestsHelpers.stopDb();
    });

    beforeEach(async () => {
        await TestsHelpers.syncDb();
    });

    it('should register a new user successfully', async () => {
        await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test123#' }).expect(200);
        const { User } = models;
        const users = await User.findAll();
        expect(users.length).toEqual(1);
        expect(users[0].email).toEqual('test@example.com');
    });


    it('should register a new user successfully with roles', async () => {
        await request(app).post('/v1/register')
            .send({ email: 'test@example.com', password: 'Test123#', roles: ['admin', 'customer'] })
            .expect(200);
        const { User, Role } = models;
        const users = await User.findAll({include: Role});
        expect(users.length).toEqual(1);
        expect(users[0].email).toEqual('test@example.com');
        const roles = users[0]['Roles'];
        expect(roles.length).toEqual(2);
        expect(roles[0].role).toEqual('admin');
        expect(roles[1].role).toEqual('customer');
    });

    it('should not create a new user if it already exists', async () => {
        await request(app).post('/v1/register').send({ email: 'test@example.com', password: 'Test123#' }).expect(200);
        const response = await request(app).post('/v1/register')
            .send({ email: 'test@example.com', password: 'Test123#' })
            .expect(200);
        expect(response.body).toEqual({ success: false, message: 'User already exists' });
    });

    it('should not create a new user if email and password are not provided', async () => {
        await request(app).post('/v1/register').send({}).expect(500);
        const { User} = models;
        const users = await User.findAll();
        expect(users.length).toEqual(0);
    });
});