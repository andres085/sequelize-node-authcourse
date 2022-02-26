import JWTUtils from '../utils/jwt-utils';

function requiresAuth(tokenType = 'accessToken') {
    return function (req, res, next) {
        const authHeader = req.headers.authorization

        if (authHeader) {
            try {
                
                var [bearer, token] = authHeader.split(' ');

                if (bearer.toLowerCase() !== 'bearer' || !token) {
                    throw Error;
                }

            } catch (error) {
                return res.status(401).send({
                success: false,
                message: 'Wrong bearer token'
            });
            }
         
        } else {
            return res.status(401).send({
                success: false,
                message: 'Authorization header not found'
            });
        }

        try {
            let jwt;
            switch (tokenType) {
                case 'refreshToken':
                    jwt = JWTUtils.verifyRefreshtoken(token);
                    break;
                case 'accessToken':
                default:
                    jwt = JWTUtils.verifyAccessToken(token);
                    break;
            }
            req.body.jwt = jwt;
            next();
        } catch (error) {
              return res.status(401).send({
                success: false,
                message: 'Invalid Token'
            });
        }
        
    }
}

export default requiresAuth;
