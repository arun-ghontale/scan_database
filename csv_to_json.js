const path = require('path');
const csv = require('csvtojson')
// const request = require('request');
const syncRequest = require('sync-request');
const sendMail = require('./send_mail')
const moment = require('moment')

const scanFilesDir = 'SCAN_FILES'
let responseStatus = 0
let totalDocs = 0

const user_args = {}
process.argv.slice(2).map((each) => {
    user_args[each.split('=').slice(0)[0]] = each.split('=').slice(1)[0];
});

const csvFilePath = path.join(__dirname, scanFilesDir, user_args.file)
console.log(path.join(__dirname, scanFilesDir, user_args.file))

csv()
    .fromFile(csvFilePath)
    .then((jsonObjList) => {
        // console.log(jsonObjList);
        logStatus = ''
        jsonObjList.forEach((jsonObj) => {
            let data = {
                resub_count: jsonObj["resub_count"],
                planet_name: jsonObj["PLANET_NAME"],
                first_time_sumbission: jsonObj["First submission Time"],
                latest_submission_time: jsonObj["Latest submission Time"],
                latest_active_time: jsonObj["Latest active Time"],
                submission_type: jsonObj["submission type"],
                student_name: jsonObj["student name"],
                link: jsonObj["link"],
                assignment_name: jsonObj["ASSIGNMENT_NAME"],
                student_id: jsonObj["link"].split('/').slice(-1)[0],
                done_status: parseInt(jsonObj["Completed"])
            }

            //sync request
            var res = syncRequest('POST', 'http://localhost:3000/scan', {
                json: data,
            });
            var response = JSON.parse(res.getBody('utf8'));
            if (!('Error' in response)) {
                responseStatus += 1
            } else if ('Error' in response) {
                logStatus += ` Student name: ${data.student_name}, Error: ${response.Error}` + '\n'
            }
            totalDocs += 1
        })
        sendMail({
            subject: `Database update: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`,
            text: `${responseStatus} documents successfully added to the database out of ${totalDocs} documents`,
            logStatus: logStatus
        })
    })