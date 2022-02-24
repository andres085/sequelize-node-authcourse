import { Router } from 'express';
import models from '../../models';
import JWTUtils from '../../utils/jwt-utils';
import runAsyncWrapper from '../../utils/runAsyncWrapper';

const router = Router();

const { User } = models;

router.post('/login', runAsyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await User.comparePasswords(password, user.password))) {
        return res.status(401).send({
            success: false,
            message: 'Invalid credentials'
        })
    }

    const payload = { email };
    const accessToken = JWTUtils.generateAcessToken(payload);
    const savedRefreshToken = await user.getRefreshToken();

    let refreshToken;

    if (!savedRefreshToken || !savedRefreshToken.token) {
        refreshToken = JWTUtils.generateRefreshToken(payload);

        if (!savedRefreshToken) {
            await user.createRefreshToken({ token: refreshToken });
        } else {
            user.RefreshToken.token = refreshToken;
            await user.RefreshToken.save();
        }
    } else {
        refreshToken = savedRefreshToken.token;
    }

    return res.status(200).send({
        success: true,
        message: 'Successfully login',
        data: {
            accessToken,
            refreshToken
        }
    })
}));

export default router;