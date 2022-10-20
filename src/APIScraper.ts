import axios from "axios";
import puppeteer from "puppeteer";
import User from "./types/User";
import Event from "./types/Event";
import Color from "colors";

const USER_API_URL = "https://connect.uwstout.edu/mobile_ws/v17/mobile_engagement";
const EVENT_API_URL = "https://connect.uwstout.edu/mobile_ws/v17/mobile_events_list";
const AUTH_URL = "https://www.campusgroups.com/shibboleth/uwstout";
const USERNAME = "USERNAME";
const PASSWORD = "PASSWORD";

export default class APIScraper {
    _cookies: any;

    async authenticate() {
        console.log(Color.yellow("Authenticating..."));
        try {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox"
                ]
            });
            const page = await browser.newPage();
            await page.goto(AUTH_URL);
            await page.type("#ctl00_cnt_usernameTextBox", USERNAME);
            await page.type("#ctl00_cnt_passwordTextBox", PASSWORD);
            await page.click("#ctl00_cnt_loginbutton");
            await page.waitForNavigation();
            await page.waitForNetworkIdle();
            this._cookies = await page.cookies();
            await browser.close();
            console.log(Color.green("Authentication complete"));
        } catch (e) {
            console.log(Color.red("Authentication failed"));
            console.log(Color.red(e));
        }
    }

    async getTopUsers(offset: number, limit: number): Promise<User[]> {
        if (!this._cookies) {
            await this.authenticate();
        }
        try {
            const response = await axios.get(USER_API_URL, {
                params: {
                    range: offset,
                    limit
                },
                headers: {
                    cookie: this._cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join("; ")
                }
            });
            const data = response.data;
            return data.map((user: any): User => ({
                id: parseInt(user.p0),
                uid: user.p1,
                profileURL: user.p2,
                firstName: user.p3,
                lastName: user.p4,
                accountType: user.p5,
                email: user.p7,
                pointCount: parseInt(user.p8),
                pointPosition: -1,
            }));
        } catch (e) {
            console.log(Color.red("Error parsing data"));
            console.log(Color.red(e));
            console.log(Color.red("Re-authenticating again in 5 seconds..."));
            await new Promise(resolve => setTimeout(resolve, 5000));
            this._cookies = undefined;
            return this.getTopUsers(offset, limit);
        }
    }

    async getEvents(offset: number, limit: number): Promise<Event[]> {
        if (!this._cookies) {
            await this.authenticate();
        }
        try {
            const response = await axios.get(EVENT_API_URL, {
                params: {
                    range: offset,
                    limit
                },
                headers: {
                    cookie: this._cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join("; ")
                }
            });
            const data = response.data as any[];
            const filteredData = data.filter((e: any) => e.p10 !== undefined).filter((e: any) => !isNaN(parseInt(e.p1)));
            return filteredData.map((event: any): Event => ({
                id: parseInt(event.p1),
                uid: event.p2,
                name: event.p3,
                startTime: this._parseDate(event.p4),
                category: event.p5,
                clubName: event.p9,
                attendeeCount: parseInt(event.p10),
                thumbnailURL: event.p11,
                cost: event.p12,
            }));
        } catch (e) {
            console.log(Color.red("Error parsing data"));
            console.log(Color.red(e));
            console.log(Color.red("Re-authenticating again in 5 seconds..."));
            await new Promise(resolve => setTimeout(resolve, 5000));
            this._cookies = undefined;
            return this.getEvents(offset, limit);
        }
    }

    _parseDate(date: string): number {
        if (date === undefined || date === null || date === "") {
            return -1;
        }
        const splitDate = date.split("</p>");
        const plainDate = splitDate[0].replaceAll("<p style='margin:0;'>", "").replaceAll("&ndash;", "");
        const startDate = new Date(plainDate);
        const timestamp = startDate.getTime();
        if (isNaN(timestamp)) {
            return -1;
        }
        return timestamp;
    }

}