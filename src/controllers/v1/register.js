import { Router } from 'express';
import models from '../../models';
import JWTUtils from '../../utils/jwt-utils';
import runAsyncWrapper from '../../utils/runAsyncWrapper';

const router = Router();

const { User, Role, RefreshToken, sequelize } = models;

router.post('/register', runAsyncWrapper(async (req, res) => {
    const { email, password, roles } = req.body;
    const user = await User.findOne({
        where: { email }
    });

    if (user) {
        return res.status(200).send({
            success: false,
            message: 'User already exists'
        });
    }
    const result = await sequelize.transaction(async () => {
        const jwtPayload = { email };
        const accessToken = JWTUtils.generateAcessToken(jwtPayload);
        const refreshToken = JWTUtils.generateRefreshToken(jwtPayload);

        let rolesToSave = [];
        if (roles && Array.isArray(roles)) {
            rolesToSave = roles.map((role) => ({ role }));
        }
        await User.create({ email, password, Roles: rolesToSave, RefreshToken: {token: refreshToken} }, {include: [Role, RefreshToken]});
    
        return { accessToken, refreshToken };
    });
    const { accessToken, refreshToken } = result;
    
    return res.send({
        success: true,
        message: 'User successfully registered',
        data: {
            accessToken,
            refreshToken
        }
    })
    
}))

export default router;