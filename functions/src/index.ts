import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as puppeteer from 'puppeteer';

admin.initializeApp(); // needed to initialize the admin sdk
const db = admin.firestore();

export const scraper = functions.runWith( { memory: '2GB' }).region("australia-southeast1").pubsub

    .schedule('*/15 * * * *').onRun(async context => {
        const url = 'https://www.stuff.co.nz/';
    
        
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url);
      

    
    
        let texts = await page.evaluate(() => {
            let data = [];
            let elements = document.getElementsByTagName('article');
            for (var element of elements){
                //try get link
                try{
                const head = element.getElementsByTagName('a')[0];
                let link = head.href

                let intro_el   = head.getElementsByTagName('P');

                let intro = intro_el[0].textContent;
                
                

                data.push({intro:intro, link:link});
                }
                catch{
                    data.push({element:element.innerText,success: "No"})
                }
            }
            return data;
        });
        db.collection('logs').add({ content: texts })

        await browser.close();

       

    });

