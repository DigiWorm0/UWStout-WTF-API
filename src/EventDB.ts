import { DataTypes, Sequelize } from 'sequelize';
import Event from './types/Event';

export default class EventDB {
    _db: Sequelize;
    _eventModel: any;

    constructor() {
        this._db = new Sequelize({
            dialect: 'sqlite',
            storage: 'event-db.sqlite',
            logging: false,
        });
        this._eventModel = this._db.define('event', {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: false,
            },
            uid: DataTypes.STRING,
            name: DataTypes.STRING,
            startTime: DataTypes.INTEGER,
            category: DataTypes.STRING,
            clubName: DataTypes.STRING,
            attendeeCount: DataTypes.INTEGER,
            thumbnailURL: DataTypes.STRING,
            cost: DataTypes.STRING,
        });
    }

    async init() {
        await this._db.sync();
    }

    async updateEvents(events: Event[]) {
        await this._eventModel.bulkCreate(events, {
            updateOnDuplicate: ['uid', 'name', 'startTime', 'category', 'clubName', 'attendeeCount', 'thumbnailURL', 'cost'],
        });
    }

    async getMostAttendedEvents(offset: number, limit: number) {
        return await this._eventModel.findAll({
            order: [
                ['attendeeCount', 'DESC'],
            ],
            offset: offset,
            limit: limit,
        });
    }

    async getRecentEvents(offset: number, limit: number) {
        return await this._eventModel.findAll({
            order: [
                ['startTime', 'DESC'],
            ],
            offset: offset,
            limit: limit,
        });
    }

    async getEventCount() {
        return await this._eventModel.count();
    }
}