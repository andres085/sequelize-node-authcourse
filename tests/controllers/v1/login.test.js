import TestsHelpers from '../../test-helpers';
import models from '../../../src/models';
import request from 'supertest';

describe('login', () => {
    let app;
    let newUserResponse;

    beforeAll(async () => {
        await TestsHelpers.startDb();
        app = TestsHelpers.getApp();
    });

    afterAll(async () => {
        await TestsHelpers.stopDb();
    });

    beforeEach(async () => {
        await TestsHelpers.syncDb();
        newUserResponse = await TestsHelpers.registerNewUser({ email: 'test@example.com', password: 'Test123#' });
    });

    it('should login a user successfully and store the refresh token in database', async () => {
        const response = await request(app).post('/v1/login').send({ email: 'test@example.com', password: 'Test123#' }).expect(200);

        const refreshToken = response.body.data.refreshToken;
        const { RefreshToken } = models;
        
        const savedRefreshToken = await RefreshToken.findOne({ where: { token: refreshToken } });
        expect(savedRefreshToken).toBeDefined();
        expect(savedRefreshToken.token).toEqual(refreshToken);
    });

    it('should return 401 if the user is not found', async () => {
        const response = await request(app).post('/v1/login').send({ email: 'invalid.user@example.com', password: 'Test123#' }).expect(401);
        expect(response.body.success).toEqual(false);
        expect(response.body.message).toEqual('Invalid credentials');
    });

    it('should return 401 if the password is invalid', async () => {
        const response = await request(app).post('/v1/login').send({ email: 'test@example.com', password: 'Test123!' }).expect(401);
        expect(response.body.success).toEqual(false);
        expect(response.body.message).toEqual('Invalid credentials');
    });

    it('should return the same refresh token if the user is already logged in', async () => {
        const response = await request(app).post('/v1/login').send({ email: 'test@example.com', password: 'Test123#' }).expect(200);
        expect(response.body.data.refreshToken).toEqual(newUserResponse.body.data.refreshToken);
    });

    it('should generate a new refreshtoken if it does not exist', async () => {
        const { RefreshToken } = models;
        
        await RefreshToken.destroy({ where: {} });

        let refreshTokenCount = await RefreshToken.count();
        expect(refreshTokenCount).toEqual(0);

        await request(app).post('/v1/login').send({ email: 'test@example.com', password: 'Test123#' }).expect(200);

        refreshTokenCount = await RefreshToken.count();
        expect(refreshTokenCount).toEqual(1);
    });

    it('should save the new token if its empty', async () => {
        const { RefreshToken } = models;
        
        const refreshToken = newUserResponse.body.data.refreshToken;

        const savedRefreshToken = await RefreshToken.findOne({
            where: { token: refreshToken }
        });

        savedRefreshToken.token = null;
        await savedRefreshToken.save();

        await request(app).post('/v1/login').send({ email: 'test@example.com', password: 'Test123#' }).expect(200);
        await savedRefreshToken.reload();
        expect(savedRefreshToken.token).not.toBeNull();

    });

});