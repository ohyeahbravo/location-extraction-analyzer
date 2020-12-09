const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
const PORT = 3000;

let tweets = {};

app.get('/init', (req, res) => {
    let payload = [];
    Object.keys(tweets).forEach(key => {
        payload.push({
            type: key,
            data: tweets[key]
        })
    })
    res.send(payload);
});

app.listen(PORT, () => {
    console.log('Server is listening on port: ', PORT);

    const fs = require('fs');
    const fsNdjson = require('fs-ndjson');
    const dir = 'tweets';

    fs.readdir(dir, function(err, files) {
        if (err) {
            console.log('Error getting directory information.');
        } else {
            files.forEach(function(file) {
                let path = dir + '/' + file;
                let name = file.split('.')[0];
                fsNdjson.readFile(path).then(data => {
                    tweets[name] = [];
                    data.forEach(datum => {
                        tweets[name].push(datum);
                    });
                    // console.log(tweets)
                });
            });
        }
    });
});
