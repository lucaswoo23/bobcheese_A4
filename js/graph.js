
// for more about line graphs check out this example:
// https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89
const msm = {
    width: 1000,
    height: 800,
    marginAll: 50,
    marginLeft: 50,
}
const small_msm = {
    width: 500,
    height: 500,
    marginAll: 60,
    marginLeft: 100
}

const margin = {top: 100, right: 100, bottom: 100, left: 100}
, width = 1500 - margin.left - margin.right // Use the window's width 
, height = 1500 - margin.top - margin.bottom // Use the window's height
// load data
d3.csv('data/gapminder.csv').then((data) => {

    // make an svg and append it to body
    const svg = d3.select('body').append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)

    // get only data for USA
    data2 = data
    data = data.filter(d => d['year'] == '1980')

    // get year min and max for us
    const fertilityLimits = d3.extent(data, d => d['fertility'])
    // get scaling function for years (x axis)
    const xScale = d3.scaleLinear()
        .domain([fertilityLimits[0] - .5,  + fertilityLimits[1]])
        .range([margin.left, width + margin.left])

    // make x axis
    const xAxis = svg.append("g")
        .style('font', '20px times')
        .attr("transform", "translate(0," + (height + margin.top) + ")")
        .call(d3.axisBottom(xScale))

    // get min and max life expectancy for US
    const lifeExpectancyLimits = d3.extent(data, d => d['life_expectancy']) 

    // get scaling function for y axis
    const yScale = d3.scaleLinear()
        .domain([lifeExpectancyLimits[1], lifeExpectancyLimits[0]])
        .range([margin.top, margin.top + height])

    // make y axis
    const yAxis = svg.append("g")
        .style('font', '20px times')
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale))

    let pop_data = data.map((row) => +row["population"]);
    let pop_limits = d3.extent(pop_data);
    // make size scaling function for population
    let pop_map_func = d3.scaleLinear()
      .domain([pop_limits[0], pop_limits[1]])
      .range([5, 45]);
     // make tooltip


 
    // // mapping functions
    // let xMap = map.x;
    // let yMap = map.y;

    // use d3 line generator to make a line

    // // d3's line generator
    // const line = d3.line()
    //     .x(d => xScale(d['year'])) // set the x values for the line generator
    //     .y(d => yScale(d['life_expectancy'])) // set the y values for the line generator 

    // append line to svg
    // data vs datum
    // path

    // append the div which will be the tooltip
    const div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
    
    // let toolTipChart = div.append("div").attr("id", "tipChart")
    let toolChart = div.append('svg')
    .attr('width', small_msm.width)
    .attr('height', small_msm.height)

   makeLabels();
    // append dots to svg to track data points
    svg.selectAll('.dot').data(data)
        .enter()
        .append('circle')
            .attr('cx', d => xScale(d['fertility']))
            .attr('cy', d => yScale(d['life_expectancy']))
            .attr('r', (d) => pop_map_func(d["population"]))
            .attr('fill', 'transparent')
            .attr('stroke', "#4874B7")
            .on("mouseover", function(d) {
                toolChart.selectAll("*").remove()
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                plotPopulation(d.country, toolChart)
                div//.html("Fertility:       " + d.fertility + "<br/>" +
                        // "Life Expectancy: " + d.life_expectancy + "<br/>" +
                        // "Population:      " + numberWithCommas(d["population"]) + "<br/>" +
                        // "Year:            " + d.year + "<br/>" +
                        // "Country:         " + d.country)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                    .duration(300)
                    .style('opacity', 0)
            })
      // make title and axes labels
  function makeLabels() {
    svg.append('text')
      .attr('x', 30)
      .attr('y', 40)
      .style('font-size', '30pt')
      .text("Countries by Life Expectancy and Fertility Rate (1980)");

    svg.append('text')
      .attr('x', 650)
      .attr('y', 1450)
      .style('font-size', '20pt')
      .text('Fertility Rates (Avg Children per Woman)');

    svg.append('text')
      .attr('transform', 'translate(30, 800)rotate(-90)')
      .style('font-size', '20pt')
      .text('Life Expectancy (years)');
  }

  function plotPopulation(country, toolChart) {
    let countryData = data2.filter((row) => {return row.country == country})
    let population = countryData.map((row) => parseInt(row["population"]));
    let year = countryData.map((row) => parseInt(row["year"]));

    let axesLimits = findMinMax(year, population);
    let mapFunctions = drawAxes(axesLimits, "year", "population", toolChart, small_msm);
    toolChart.append("path")
        .datum(countryData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
                    .x(function(d) { return mapFunctions.xScale(d.year) })
                    .y(function(d) { return mapFunctions.yScale(d.population) }))
    makeToolKitLabels(toolChart, small_msm, "Population Over Time For " + country, "Year", "Population");
}

// make title and axes labels
function makeToolKitLabels(svgContainer, msm, title, x, y) {
    svgContainer.append('text')
        .attr('x', (msm.width / 2) - 160)
        .attr('y', msm.marginAll / 2 + 10)
        .style('font-size', '16pt')
        .text(title);

    svgContainer.append('text')
        .attr('x', (msm.width / 2) - 20)
        .attr('y', msm.height - 10)
        .style('font-size', '12pt')
        .text(x);

    svgContainer.append('text')
        .attr('transform', 'translate( 15,' + (msm.height / 2 + 30) + ') rotate(-90)')
        .style('font-size', '12pt')
        .text(y);
}
// draw the axes and ticks
function drawAxes(limits, x, y, svgContainer, msm) {
    // return x value from a row of data
    let xValue = function (d) {
        return +d[x];
    }

    // function to scale x value
    let xScale = d3.scaleLinear()
        .domain([limits.xMin - 1, limits.xMax + 1]) // give domain buffer room
        .range([0 + msm.marginLeft, msm.width - msm.marginAll])

    // xMap returns a scaled x value from a row of data
    let xMap = function (d) {
        return xScale(xValue(d));
    };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
        .attr('transform', 'translate(0, ' + (msm.height - msm.marginAll) + ')')
        .call(xAxis)
        .selectAll("text")
            .attr("transform", "translate(-1,1)rotate(-25)")
            .style("text-anchor", "end")
            .style("font-size", 14);

    // return y value from a row of data
    let yValue = function (d) {
        return +d[y]
    }

    // function to scale y
    let yScale = d3.scaleLinear()
        .domain([limits.yMax + 5, limits.yMin - 5]) // give domain buffer
        .range([0 + msm.marginAll, msm.height - msm.marginAll])

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) {
        return yScale(yValue(d));
    };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
        .attr('transform', 'translate(' + msm.marginLeft + ', 0)')
        .call(yAxis)
        .selectAll("text")
            .attr("transform", "translate(-1,-18)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", 13);

    // return mapping and scaling functions
    return {
        x: xMap,
        y: yMap,
        xScale: xScale,
        yScale: yScale
    };
}

function findMinMax(x, y) {

    // get min/max x values
    let xMin = d3.min(x);
    let xMax = d3.max(x);

    // get min/max y values
    let yMin = d3.min(y);
    let yMax = d3.max(y);

    // return formatted min/max data as an object
    return {
        xMin: xMin,
        xMax: xMax,
        yMin: yMin,
        yMax: yMax
    }
}
    

})