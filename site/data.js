var splunkjs = require('splunk-sdk');
var SplunkStreams = require('splunkstreams');

var service = new splunkjs.Service({
    host: "localhost",
    port: 4089,
    username: "admin",
    password: "changeme",
    version: "5.0"
});

var query = " \
search index=_internal sourcetype=*_access bytes=* \
| rangemap field=bytes 0=0-1000 1=1001-2000 2=2001-3000 3=3001-4000 4=4001-5000 5=5001-6000 6=6001-7000 7=7001-8000 8=8001-9000 9=9001-10000 10=10001-11000 11=11001-12000 12=12001-13000 13=13001-14000 14=14001-15000 15=15001-16000 16=16001-17000 17=17001-18000 18=18001-19000 19=19001-20000 20=20001-21000 21=21001-22000 22=22001-23000 23=23001-24000 24=24001-25000 25=25001-26000 26=26001-27000 27=27001-28000 28=28001-29000 29=29001-30000 30=30001-31000 31=31001-32000 32=32001-33000 33=33001-34000 34=34001-35000 35=35001-36000 36=36001-37000 37=37001-38000 38=38001-39000 39=39001-40000 40=40001-41000 41=41001-42000 42=42001-43000 43=43001-44000 44=44001-45000 45=45001-46000 46=46001-47000 47=47001-48000 48=48001-49000 49=49001-50000 default=50 \
| timechart span=1s count by range partial=f \
| table _time 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 \
| fillnull 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50";


var search = {
    search: query,
    earliest_time: "rt-60s",
    latest_time: "rt"
};

var dataStream = new SplunkStreams.RealTime(service, search);

var lastTimeSeen = new Date(0);
var transformStream = new SplunkStreams.Transform(function(data, emit) {
    var rows = data.rows || [];
    for(var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var time = new Date(parseInt(row[0]));
        
        if (time > lastTimeSeen) {
            lastTimeSeen = time;
            emit({time: time.valueOf(), result: row.slice(1)});
        }
    }
    
    return true;
});

module.exports = {
    transform: dataStream.pipe(transformStream),
    data: dataStream,
    clear: function() { lastTimeSeen = new Date(0); }
};