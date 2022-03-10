import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import environment from '../config/environment';
import JWTUtils from '../utils/jwt-utils';

export default (sequelize) => {
    class User extends Model {

        static associate(models) {
            User.Roles = User.hasMany(models['Role']);
            User.RefreshToken = User.hasOne(models['RefreshToken']);
        }

        static async hashPassword(password) {
            return bcrypt.hash(password, environment.saltRounds);
        }

        static async comparePasswords(password, hashedPassword) {
            return bcrypt.compare(password, hashedPassword);
        }

        static async createNewUser({ email, password, username, firstname, roles }) {
            return sequelize.transaction(async () => {
                const jwtPayload = { email };
                const accessToken = JWTUtils.generateAcessToken(jwtPayload);
                const refreshToken = JWTUtils.generateRefreshToken(jwtPayload);

                let rolesToSave = [];
                if (roles && Array.isArray(roles)) {
                    rolesToSave = roles.map((role) => ({ role }));
                }
                await User.create({ email, password, Roles: rolesToSave, RefreshToken: {token: refreshToken} }, {include: [User.Roles, User.RefreshToken]});
            
                return { accessToken, refreshToken };
            });
        }
    }

    User.init({
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: 'Not a valid email address'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING(50),
            unique: true
        },
        firstName: {
            type: DataTypes.STRING(50),
            validate: {
                len: {
                    args: [0, 50],
                    msg: 'First name has too many characters'
                }
            }
        },
        lastName: {
            type: DataTypes.STRING(50),
            validate: {
                len: {
                    args: [0, 50],
                    msg: 'Last name has too many characters'
                }
            }
        }
    }, {
        sequelize,
        modelName: 'User',
        indexes: [{unique: true, fields: ['email']}],
    });

    User.beforeSave(async (user, options) => {
        const hashedPassword = await User.hashPassword(user.password);
        user.password = hashedPassword;
    });

    return User;
};