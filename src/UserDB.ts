import { DataTypes, Op, Sequelize } from 'sequelize';
import User from './types/User';

export default class UserDB {
    _db: Sequelize;
    _userModel: any;

    constructor() {
        this._db = new Sequelize({
            dialect: 'sqlite',
            storage: 'user-db.sqlite',
            logging: false,
        });
        this._userModel = this._db.define('user', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: false,
            },
            uid: DataTypes.STRING,
            profileURL: DataTypes.STRING,
            firstName: DataTypes.STRING,
            lastName: DataTypes.STRING,
            accountType: DataTypes.STRING,
            email: DataTypes.STRING,
            pointCount: DataTypes.INTEGER,
            pointPosition: DataTypes.INTEGER,
        });
    }

    async init() {
        await this._db.sync();
    }

    async updateUsers(users: User[]) {
        await this._userModel.bulkCreate(users, {
            updateOnDuplicate: ['uid', 'profileURL', 'firstName', 'lastName', 'accountType', 'email', 'pointCount'],
        });
    }

    async updatePointPositions() {
        const users = await this._userModel.findAll({
            order: [['pointCount', 'DESC']],
        });
        for (let i = 0; i < users.length; i++) {
            users[i].pointPosition = i + 1;
            await users[i].save();
        }
    }

    async getTopUsers(offset: number, limit: number) {
        return await this._userModel.findAll({
            order: [
                ['pointPosition', 'ASC'],
            ],
            where: {
                pointPosition: {
                    [Op.gt]: -1,
                },
            },
            offset,
            limit,
        });
    }

    async searchUsers(query: string, limit: number) {
        const names = query.split(" ");
        return await this._userModel.findAll({
            where: names.length > 1 ? {
                [Op.and]: [
                    {
                        firstName: {
                            [Op.like]: `%${names[0]}%`,
                        },
                    },
                    {
                        lastName: {
                            [Op.like]: `%${names[1]}%`,
                        },
                    },
                ],
            } : {
                [Op.or]: [
                    {
                        firstName: {
                            [Op.like]: `%${query}%`,
                        },
                    },
                    {
                        lastName: {
                            [Op.like]: `%${query}%`,
                        },
                    },
                ],
            },
            limit,
            order: [
                ['pointPosition', 'ASC'],
            ],
        });
    }

    async getUserCount() {
        return await this._userModel.count();
    }
}