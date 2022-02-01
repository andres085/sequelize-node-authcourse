const environment = {
    port: parseInt(process.env.PORT) || 8080,
    nodeEnv: process.env.NODE_ENV || 'production',
    saltRounds: parseInt(process.env.SALT_ROUNDS) || 10,
    jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '2c72bae7ddf3636e887da5f69012e4ca4318c2a8d0116a8780f046d396dc1af91ec9d1c48e2d2aba6fcd620c6762991e2f62c005c0cb0a2f0e7f10e3631e53f2',
    jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'c9ad97baccc6dc3cd3d009c7a7edd1a418ac0dd0d295dd2ebe1e00791b76a44d7d966ed8e44c0d68eda35008368f5d49fe9987b8af53c873205a18b450f40c82'
};

export default environment;