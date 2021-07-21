import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as puppeteer from 'puppeteer';

admin.initializeApp(); // needed to initialize the admin sdk
const db = admin.firestore();

export const taskRunner = functions.runWith( { memory: '2GB' }).region("australia-southeast1").pubsub

    .schedule('*/15 * * * *').onRun(async context => {
        const url = 'https://www.stuff.co.nz/';
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url);
    
        const title = await page.title()
    
        await browser.close();

        db.collection('logs').add({ hello: title })

    });

