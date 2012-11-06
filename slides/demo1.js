function runDemo1() {
    var template = "\
<table> \
    <thead> \
        <th colspan='2'><h6>Men</h6></th> \
        <th colspan='2'><h6>Women</h6></th> \
    </thead> \
    <tbody> \
        <% _.each(results, function(r) { %> \
            <tr> \
                <td class='gender'><span><%=r[0].category%></span></td> \
                <td class='count'> <span><%=r[0].count%></span></td> \
                <td class='gender'><span><%=r[1].category%></span></td> \
                <td class='count'> <span><%=r[1].count%></span></td> \
            </tr>  \
        <% }); %> \
    </tbody> \
</table> \
";
    
    var dataLoaded = function(data, res, req) {
        var $container = $("#demo1");
        var male = _.filter(data.results, function(r) { return r.gender === "male" });
        var female = _.filter(data.results, function(r) { return r.gender === "female" });
        var all = _.zip(male, female);
        
        $container.html(_.template(template, { results: all }));
    };
    
    $.ajax({
        type: 'POST',
        url: '/demo1',
        success: dataLoaded,
        error: function() {
            console.log("ERROR WITH DEMO 1", arguments);
            alert("ERROR WITH DEMO 1");
        }
    });
};