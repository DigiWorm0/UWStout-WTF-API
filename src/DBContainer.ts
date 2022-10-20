import APIScraper from "./APIScraper";
import UserDB from "./UserDB";
import EventDB from "./EventDB";
import Color from "colors";

const USERS_SIZE = 100;
const EVENTS_SIZE = 20;

export default class DBContainer {
    _userDB: UserDB;
    _eventDB: EventDB;
    _scraper: APIScraper;

    constructor() {
        this._userDB = new UserDB();
        this._eventDB = new EventDB();
        this._scraper = new APIScraper();

        const userInit = this._userDB.init()
        const eventInit = this._eventDB.init();

        Promise.all([userInit, eventInit]).then(() => {
            const shouldUpdate = process.argv.includes("--update");
            const shouldUpdatePast = process.argv.includes("--update-past");
            const shouldAuth = process.argv.includes("--auth");
            const shouldUpdatePoints = process.argv.includes("--update-points");
            if (shouldUpdatePast)
                this.updateAllPast();
            if (shouldUpdate)
                this.updateAllFuture();
            else if (shouldAuth)
                this._scraper.authenticate();
            else if (shouldUpdatePoints)
                this._updateUserPointPos();
            setInterval(() => this.updateAllFuture(), 1000 * 60 * 60 * 24);
        });
    }

    async updateAllPast() {
        await this.updateEvents(0, true);
    }

    async updateAllFuture() {
        await this.updateEvents(0, false);
        await this.updateUsers(0);
        await this._updateUserPointPos();
    }

    async _updateUserPointPos() {
        console.log(Color.yellow("Updating point positions..."));
        await this._userDB.updatePointPositions();
        console.log(Color.green("Updated point positions"));
    }

    /*
        Users
    */
    async updateUsers(page: number) {
        const users = await this._scraper.getTopUsers(page * USERS_SIZE, USERS_SIZE);
        console.log(Color.yellow(`Updating ${users.length} users from page ${page}...`));
        await this._userDB.updateUsers(users);
        if (users.length > 0) {
            await this.updateUsers(page + 1);
        }
    }
    async getTopUsers(offset: number = 0, limit: number = USERS_SIZE) {
        return await this._userDB.getTopUsers(offset, limit);
    }
    async searchUsers(query: string, limit: number = USERS_SIZE) {
        return await this._userDB.searchUsers(query, limit);
    }
    async getUserCount() {
        return await this._userDB.getUserCount();
    }

    /*
        Events
    */
    async updateEvents(page: number, isPast: boolean) {
        const events = await this._scraper.getEvents(page * EVENTS_SIZE, EVENTS_SIZE, isPast);
        console.log(Color.yellow(`Updating ${events.length} events from page ${page}...`));
        await this._eventDB.updateEvents(events);
        if (events.length > 0) {
            await this.updateEvents(page + 1, isPast);
        }
    }
    async getRecentEvents(offset: number = 0, limit: number = EVENTS_SIZE) {
        return await this._eventDB.getRecentEvents(offset, limit);
    }
    async getEventCount() {
        return await this._eventDB.getEventCount();
    }
}