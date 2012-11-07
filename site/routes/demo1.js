var splunkjs = require('splunk-sdk');

var service = new splunkjs.Service({
    host: "localhost",
    port: "4089",
    username: "admin",
    password: "changeme",
    version: "5.0"
});

module.exports = function(req, res) {
    service.login(function(err, success) {
        if (err || !success) {
            console.log("Error loggin in", err || success);
            res.status(500);
            
            return;
        } 
        
        var query = "" 
            + "search index=foursquare checkin.user.gender=male OR checkin.user.gender=female "
            + "| rename checkin.primarycategory.nodename as category, checkin.user.gender as gender"
            + "| top category by gender";
            
        service.oneshotSearch(
            query, 
            {earliest_time: "-15m", latest_time: "now", output_mode: "json"}, 
            function(err, results) {
                res.json(results);
            });
    });
};