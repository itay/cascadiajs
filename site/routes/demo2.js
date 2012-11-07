var splunkjs = require('splunk-sdk');
var SplunkStreams = require('splunkstreams');
var _ = require('underscore');

var service = new splunkjs.Service({
    host: "localhost",
    port: "4089",
    username: "admin",
    password: "changeme",
    version: "5.0"
});

var query = ''
 + 'search index=rtv NOT retweeted_status.id | eval text=lower(text) | fields text ' + '\n'
 + '| rex field=text max_match=1000 "(?<token>\\w{5,})" ' + '\n'
 + '| eval token=mvfilter(NOT match(token, "\\d")) ' + '\n'
 + '| eval token=mvfilter(NOT match(token, "\\s")) ' + '\n'
 + '| eval token=mvfilter(NOT match(token, "(http|https|.*look.*|.*about.*|iwinemaker|lmbloxms|really|their|there)")) ' + '\n'
 + '| eval candidate=if(searchmatch("*obama* AND *romney*"), "obama:romney", if(searchmatch("*romney*"), "romney", if(searchmatch("*obama*"), "obama", null))) ' + '\n'
 + '| where NOT isnull(candidate) ' + '\n'
 + '| makemv delim=":" candidate ' + '\n'
 + '| top token by candidate limit=75'; + '\n'


var searchOptions = {
    search: query,
    earliest_time: "rt-5m",
    latest_time: "rt"
};

var stream = new SplunkStreams.RealTime(service, searchOptions);
var transform = new SplunkStreams.Transform(function(data, emit) {
    var rows = data.rows;
    
    var terms = {max: 0, obama: {}, romney: {}};
    _.each(rows, function(row) {
        var candidate = row[0];
        var term = row[1];
        var count = parseInt(row[2]);
        
        if (term == "obama" || term == "romney") {
            return;
        }
        
        terms.max = Math.max(terms.max, count);
        terms[candidate][term] = count;
    });
    
    emit(terms);
    
    return true;
});

module.exports = {
    raw: stream.interval(5000),
    transformed: stream.pipe(transform)
};