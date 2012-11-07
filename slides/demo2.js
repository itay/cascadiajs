function runDemo2() {
  var hashtagsData;
  var words;
  var fontSize = {};

  function cloudQuantize(d) {
    return "q6-9"; 
  }
    
  // PIE CHART  
  
  var w = 400;
  var h = 400;
  
  var candidateColors = {obama: "PuBu", romney: "Reds"};
  
  var createCloud = function(candidate, colorClass) {
    var layout = d3.layout.cloud()
        .timeInterval(10)
        .spiral("rectangular")
        .size([w, h])
        .fontSize(function(d) { return fontSize[candidate](+d.value); })
        .font("Impact")
        .extra(function(d) { return d.candidate; })
        .text(function(d) { return d.key; })
        .on("end", draw);

    var svg = d3.select("#demo2").append("svg")
        .attr("class", "cloud")
        .attr("width", w)
        .attr("height", h)
        .style("background", "#1A1919");

    var background = svg.append("g"),
        vis = svg.append("g")
        .attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

    function draw(data, bounds) {
        var exportedData = {
          width: w, 
          height: h,
          words: data
        };
      
        scale = bounds ? Math.min(
            w / Math.abs(bounds[1].x - w / 2),
            w / Math.abs(bounds[0].x - w / 2),
            h / Math.abs(bounds[1].y - h / 2),
            h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;
        words = data;
        var text = vis.selectAll("text")
            .data(words, function(d) { return d.text.toLowerCase(); });
        text.transition()
            .duration(1000)
            .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
            .style("font-size", function(d) { return d.size + "px"; });
        text.enter().append("text")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
            .style("font-size", function(d) { return d.size + "px"; })
            .style("opacity", 1e-6)
          .transition()
            .duration(1000)
            .style("opacity", 1);
        text.style("font-family", function(d) { return d.font; })
            .text(function(d) { return d.text; })
            .style("fill", function(d) { 
                return colorbrewer[candidateColors[d.extra]]["9"]["6"];
            });
            
        var exitGroup = background.append("g")
            .attr("transform", vis.attr("transform"));
        var exitGroupNode = exitGroup.node();
        text.exit().each(function() {
          exitGroupNode.appendChild(this);
        });
        exitGroup.transition()
            .duration(1000)
            .style("opacity", 1e-6)
            .remove();
        vis.transition()
            .delay(1000)
            .duration(750)
            .attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
    }
    
    return layout;
  }
  
  var cloud = createCloud("obama", "PuBu");
  
  var updateCloud = function() {    
    words = {};
    
    var getWords = function(candidate, candidate2) {
      var data = d3.entries(hashtagsData[candidate]);
      var data2 = d3.entries(hashtagsData[candidate2]);
      
      data.forEach(function(word) {
        word.candidate = candidate;
      });
      data2.forEach(function(word) {
        word.candidate = candidate2;
      });
      
      data = data.slice(0, 100);
      data2 = data2.slice(0, 100);
      
      var combinedData = data.concat(data2);
      
      var localWords = combinedData.sort(function(a, b) { return b.value - a.value; });
      localWords = localWords.slice(0, Math.min(localWords.length, 300));
      fontSize[candidate] = d3.scale.log().range([10, 30]).domain([+localWords[localWords.length - 1].value || 1, +localWords[0].value]);
      
      var id = 0;
      localWords.forEach(function(word) {
        word.id = id++;
      });
      
      return localWords;
    }
    
    // Update cloud
    cloud.stop().words(getWords("obama", "romney")).start();
  }
  
  // Socket handling
  var socket = io.connect('/demo2');  
  
  socket.on("data", function(data) {
    hashtagsData = data;
    updateCloud();
  });
};