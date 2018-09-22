const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser')

const app = express();
const url = 'mongodb://meetesh:meetesh123@ds243931.mlab.com:43931/rith_d';

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('This is the API, nothing to do here');
});

MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    const dbo = client.db('rith_d');
    app.listen( process.env.PORT || 7770, () => {
        console.log('server is live on 7770');
    });

    app.post('/get-hiereachy', (req, res) => {
        const admin = true; // altering this flag changes the hierarchy that will be shown on the left side
        let access;
        if(!admin) {
            access = req.body.access;
            if(access === undefined || access === null) return res.json({
                error: false,
                mssg: 'invalid access type'
            });
        }
        
        // console.log(req.body);
        // access can be a string or 
        dbo.collection('organisations').findOne({ _id: 'menime' }, (err, result) => {
            if(err || result == null ) return res.json({
                error: false,
                data: 'Hello World'
            });
            if(!admin) {
                console.log(result.hierarchy, access);
                findObjectByKey(result.hierarchy, 'uid', access, (result_filtered) => {
                    console.log(result_filtered);
                    return res.json({
                        error: false,
                        data: [result_filtered]
                    });    
                });
            } else {
                return res.json({
                    error: false,
                    data: result.hierarchy
                });
            }

        });
        
    });

    app.post('/get-data', (req, res) => {
        const type = parseInt(req.body.type);
        const uid = req.body.uid;
        if(type === undefined || uid === undefined) res.json({
            error: false,
            mssg: 'invalid type'
        });
        switch(type) {
            case 0:
                return dbo.collection('type0').findOne({ _id: uid }, (err, result) => {
                    if(err || result == null ) return res.json({
                        error: false,
                        data: { title: 'Invalid', description: 'could not find a corresponding database entry' }
                    });
                    return res.json({
                        error: false,
                        data: result
                    });
                });
            default: 
                return res.json({
                    error: false,
                    data: { title: 'Invalid', description: 'Invalid request type' }
                });
        }

    });

  });


function findObjectByKey(array, key, value, callback) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return callback(array[i]);
        }
    }
    callback(null);
}