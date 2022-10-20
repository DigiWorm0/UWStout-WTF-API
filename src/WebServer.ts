import express from 'express';
import DBContainer from './DBContainer';
import Color from "colors";
import API_INFO from './types/APIInfo';

export default class WebServer {
    _container: DBContainer;
    _app: express.Application;
    _ports: number[];

    constructor(...ports: number[]) {
        this._container = new DBContainer();
        this._app = express();
        this._ports = ports;

        this._app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this._app.get('/', this.onRoot.bind(this));
        this._app.get('/users/top', this.onUsersTop.bind(this));
        this._app.get('/users/search', this.onUsersSearch.bind(this));
        this._app.get('/users/count', this.onUsersCount.bind(this));
        this._app.get('/events/recent', this.onEventsRecent.bind(this));
        this._app.get('/events/count', this.onEventsCount.bind(this));

        this._ports.forEach((port) => {
            this._app.listen(port, () => {
                console.log(Color.green(`Listening on port ${port}`));
            });
        });
    }

    onRoot(req: express.Request, res: express.Response) {
        console.log(Color.cyan(`Request / from ${req.ip}`));
        res.send(API_INFO);
    }

    onUsersTop(req: express.Request, res: express.Response) {
        console.log(Color.cyan(`Request /top from ${req.ip}`));

        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;
        this._container.getTopUsers(offset, limit).then((users) => {
            res.send(users);
        });
    }

    onUsersCount(req: express.Request, res: express.Response) {
        console.log(Color.cyan(`Request /count from ${req.ip}`));

        this._container.getUserCount().then((count) => {
            res.send({ count });
        });
    }

    onUsersSearch(req: express.Request, res: express.Response) {
        console.log(Color.cyan(`Request /search from ${req.ip}`));

        const query = req.query.query as string;
        if (!query) {
            res.send([]);
            return;
        }
        this._container.searchUsers(query).then((users) => {
            res.send(users);
        });
    }

    onEventsRecent(req: express.Request, res: express.Response) {
        console.log(Color.cyan(`Request /recent from ${req.ip}`));

        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;
        this._container.getRecentEvents(offset, limit).then((events) => {
            res.send(events);
        });
    }

    onEventsCount(req: express.Request, res: express.Response) {
        console.log(Color.cyan(`Request /count from ${req.ip}`));

        this._container.getEventCount().then((count) => {
            res.send({ count });
        });
    }
}