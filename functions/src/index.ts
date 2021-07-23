import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as puppeteer from 'puppeteer';

admin.initializeApp(); // needed to initialize the admin sdk
const db = admin.firestore();

export const scraper = functions.runWith( { memory: '2GB' }).region("australia-southeast1").pubsub

    .schedule('0 */1 * * *').onRun(async context => {
        const url = 'https://www.stuff.co.nz/';
    
        
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.goto(url);
      

    
    
        let texts = await page.evaluate(() => {
            let data = [];
            let elements = document.getElementsByTagName('article');
            for (var element of elements){
                let temp_dict:any = {};
                //try get link
                const head = element.getElementsByTagName('a')[0];
                
                // try catch blocks are w workaround for the firestore side of things
                
                try{
                
                let link = head.href != null ? head.href : "No Link";
                temp_dict["Link"] = link;
                }
                catch{
                    
                    temp_dict["Link"] = null;
                }

                try{
                let intro_el   = head.getElementsByTagName('P');

                let intro = intro_el[0].textContent != null ? intro_el[0].textContent : "No intro";

                temp_dict["Intro"] = intro;
                }
                catch{
                    
                    temp_dict["Intro"] = null;
                }


                try{
                    let headline_el = head.getElementsByTagName('h3')
                    
                    let headline = headline_el[0].textContent != null  ?  head.getElementsByTagName('h3')[0].textContent : "None";

                    temp_dict["Headline"] = headline
                }

                catch{
                    temp_dict["Headline"] = null
                }




                data.push(temp_dict);

               
                
             
            }
            return data;
        });
        for (var text of texts){

        try{
            db.collection('articles').add({"Headline": text["Headline"],"Intro": text["Intro"],"Link": text["Link"],"wordList":text["Headline"].split(" ") ,timestamp:  admin.firestore.Timestamp.now()})
        }
            catch{

        //db.collection('articles').add({"Headline": text["Headline"],"Intro": text["Intro"],"Link": text["Link"],timestamp:  admin.firestore.Timestamp.now()})
        }}
        await browser.close();

       

    });

