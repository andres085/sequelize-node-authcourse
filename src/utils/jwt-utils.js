import jwt from 'jsonwebtoken';
import environment from '../config/environment';

export default class JWTUtils {

    static generateAcessToken(payload, options = {}) {
        const { expiresIn = '1d' } = options;
        return jwt.sign(payload, environment.jwtAccessTokenSecret, { expiresIn });
    }

    static generateRefreshToken(payload) {
        return jwt.sign(payload, environment.jwtRefreshTokenSecret);
    }

    static verifyAccessToken(accessToken) {
        return jwt.verify(accessToken, environment.jwtAccessTokenSecret);
    }

    static verifyRefreshtoken(accessToken) {
        return jwt.verify(accessToken, environment.jwtRefreshTokenSecret);
    }
    
}
