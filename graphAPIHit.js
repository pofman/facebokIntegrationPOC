var express = require('express');
var fbGraph = require('fbgraph');

function getMemberData(req, res, next, memberId) {
    res.locals.memberId = memberId;

    next();
}

var graphAPIHit = express.Router();

graphAPIHit.param('memberId', getMemberData);

graphAPIHit.get('/:memberId', function (req, res) {
    fbGraph.setVersion('2.9');

    fbGraph.get('me/feed', null, function(err, data) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        console.log(data);
        res.json({
            memberId: res.locals.memberId,
            data: data
        });
    });
});

graphAPIHit.post('/:memberId', function (req, res) {
    var body = req.body;
    console.log(body);

    fbGraph.get(decodeURI(body.endPoint), function(err, data) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        res.json({
            data: data
        });
    });
});

graphAPIHit.get('/:memberId/fql', function (req, res) {
    var query = {
        name: 'SELECT name FROM user WHERE uid = me()',
        permissions: 'SELECT email, user_about_me, user_birthday FROM permissions WHERE uid = me()'
    };

    fbGraph.fql(query, null, function(err, data) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }

        console.log(data);
        res.json({
            memberId: res.locals.memberId,
            data: data
        });
    });
});

module.exports = graphAPIHit;
