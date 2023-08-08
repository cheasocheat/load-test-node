const loadtest = require('loadtest');
const json2xls = require('json2xls');
const fs = require('fs');

const headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55Q29kZSI6IlNUWC1GRUFUVVJFIiwiZXhwIjoxNjkxNTA5NDU1LCJzdWIiOjEzNTQsInVzZXJJZCI6MTM1NCwidXNlcm5hbWUiOiJoZW5yeS5oIiwiZmFjdG9yeUlkIjo2LCJ0eXBlIjoidG9rZW4iLCJpYXQiOjE2OTE0NjYyNTV9.bCfM2tqxeyFPgxRSlGgzuGGI4WTuHMEIDo_h_mRdqKA",
    'Content-Type': 'application/json',
}

const statusCallback = (error, result, latency) => {
    // console.log('Current latency %j, result %j, error %j', latency, result, error);
    // console.log('Current result %j, error %j', result, error)
    const {statusCode, body} = result;
    console.log(statusCode);


    // console.log('----');
    // console.log('Request elapsed milliseconds: ', result.requestElapsed);
    // console.log('Request index: ', result.requestIndex);
    // console.log('Request loadtest() instance index: ', result.instanceIndex);
}


function generateRandomString(prefix, length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = prefix;

    for (let i = 0;i < length;i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}


const options = {
    url: 'https://stx-feature-ltm.ltlabs.co/msv/references/api/ref/mactypes',
    method : "POST",
    concurrency : 10,
    maxRequests : 50,
    headers,
    statusCallback,
    body: '',
    contentType: 'application/json', // Content-Type header for POST requests
    requestGenerator: (params, options, client, callback) => {
        const requestBody = JSON.stringify({
            "code": generateRandomString('CODE', 4),
            "name": "Test",
            "desc": null,
            "factoryId": 6
        })
        // console.log('Request Body:', requestBody);
        options.headers['Content-Length'] = Buffer.byteLength(requestBody);
        const request = client(options, callback);
        request.write(requestBody);
        return request;
    }
};

loadtest.loadTest(options, function (error, result) {
    if (error) {
        return console.error('Got an error: %s', error);
    }
    console.log(`Result is : ${JSON.stringify(result)}`)
});

// loadtest.loadTest(options, handleResult);



function handleResult(error, result) {
    if (error) {
        console.error('Load test error:', error);
        return;
    }

    console.log('Load test results:', result);

    // Generate your custom report based on the result data
    const report = {
        totalRequests: result.totalRequests,
        totalErrors: result.totalErrors,
        totalTimeSeconds: result.totalTimeSeconds,
        // Add more relevant data as needed
    };

    console.log('Custom report:', report);

    // Convert report data to Excel format
    const xlsData = json2xls(report);
    fs.writeFileSync('loadtest-report.xlsx', xlsData, 'binary');

    // Generate HTML report
    const htmlReport = `
    <html>
      <head>
        <title>Load Test Report</title>
      </head>
      <body>
        <h1>Load Test Report</h1>
        <pre>${JSON.stringify(report, null, 2)}</pre>
      </body>
    </html>
  `;

    fs.writeFileSync('loadtest-report.html', htmlReport);
}
