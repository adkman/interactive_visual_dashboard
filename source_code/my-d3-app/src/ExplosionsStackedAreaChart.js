import * as d3 from "d3";
import Container from 'react-bootstrap/Container';
import { Component } from 'react';
import { Constants } from './constants/Constants';
import { LABEL } from './locale/en-us';

class ExplosionsStackedAreaChart extends Component {

    width;
    height;
    height2;

    componentDidMount() {
        const container = d3.select("#" + Constants.EXPLOSIONS_STACKED_AREA_CHART_SVG_CONTAINER_ID);
        this.width = container.node().getBoundingClientRect().width;
        this.height = container.node().getBoundingClientRect().height;
        this.drawChart();
    }

    componentDidUpdate(prevProps) {

        if (this.props.explosionsData !== prevProps.explosionsData || this.props.explosionsFeatures !== prevProps.explosionsFeatures) {
            const svg = d3.select("#" + Constants.EXPLOSIONS_STACKED_AREA_CHART_SVG_CONTAINER_ID).select("svg");
            svg.remove();
            this.drawChart();
        }
    }

    drawChart = () => {

        const {explosionsData, explosionsFeatures, nuclearCountries, colorScale} = this.props;

        if(explosionsData.length===0 || explosionsFeatures.length===0){
            return
        }
        const margin = ({ top: 30, right: 20, bottom: 40, left: 45 });
        const margin2 = {top: 430, right: 20, bottom: 30, left: 40}

        this.height2 = 30
        this.height1 = this.height - this.height2

        let prev_year = 0
        let data = []
        let dummy = {
            "Year": 0,
            "China": 0,
            "France": 0,
            "India": 0,
            "Pakistan": 0,
            "Russia": 0,
            "United Kingdom": 0,
            "United States of America": 0,
            "North Korea": 0
        }
        let curr_obj = {}
        for(let row in explosionsData){
            let country = explosionsData[row].country
            let curr_year = explosionsData[row].year
            if(prev_year !== curr_year){
                curr_obj["Year"] = prev_year
                data.push(curr_obj)
                curr_obj = JSON.parse(JSON.stringify(dummy))
                prev_year = curr_year
            }
            curr_obj[country] = curr_obj[country]+1
        }
        data = data.slice(1)

        const series = d3.stack().keys(nuclearCountries)(data)

        const x = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Year))
            .range([margin.left, this.width - margin.right])

        const x2 = d3.scaleLinear()
            .domain(d3.extent(data, d => d.Year))
            .range([margin.left, this.width - margin.right])

        const y = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
            .range([this.height1 - margin.bottom, margin.top])

        const y2 = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
            .range([165, 165 - this.height2])

        const area = d3.area()
            .x(d => x(d.data.Year))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))

        const area2 = d3.area()
            .x(d => x2(d.data.Year))
            .y0(d => y2(d[0]))
            .y1(d => y2(d[1]))

        const xAxis = g => g
            .attr("transform", `translate(0,${this.height1 - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(this.width / 80).tickSizeOuter(0))
        
        const xAxis2 = g => g
            .attr("transform", `translate(0,${235-this.height2 - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(this.width / 80).tickSizeOuter(0))

        const xTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", (this.width + margin.left) / 2)
            .attr("y", this.height1-5)
            .attr("dy", "-.25em")
            .attr("text-anchor", "middle")
            .text(LABEL.YEAR)
        
        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
    
        const yTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", -(this.height - margin.bottom) / 2)
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text(LABEL.NUMBER_OF_EXPLOSIONS)

        const svg = d3.select("#" + Constants.EXPLOSIONS_STACKED_AREA_CHART_SVG_CONTAINER_ID)
            .append("svg")
            .attr("viewBox", [0, 0, this.width, this.height]);
        
        svg.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .attr("font-weight", "bold")
            .attr("x", (this.width + margin.left) / 2)
            .attr("y", margin.top-5)
            .attr("text-anchor", "middle")
            .text(LABEL.EXPLOSION_TREND)

        svg.call(xTitle);

        svg.call(yTitle);

        var brush = d3.brushX()
        .extent([[margin.left, 136], [this.width - margin.right, 136+this.height2]])
        .on("brush end", brushed);

        function brushed({selection}) {
            var s = selection || x2.range();
            x.domain(s.map(x2.invert, x2));

            //GET FILTER FOR  YEAR
            let minYear = x.domain()[0]
            let maxYear = x.domain()[1]
            y.domain([0, d3.max(series, d => d3.max(d, d => (d["data"]["Year"]>=minYear && d["data"]["Year"]<=maxYear)?d[1]:0))]).nice()
            Line_chart.selectAll(".area").attr("d", area);
            focus.select(".axis--x").call(xAxis);
            focus.select(".axis--y").call(yAxis);
        }

        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [this.width, this.height1]])
            .extent([[0, 0], [this.width, this.height1]])
            .on("zoom", zoomed);

        function zoomed({transform}) {
            var t = transform;
            x.domain(t.rescaleX(x2).domain());
            Line_chart.selectAll(".area").attr("d", area);
            focus.select(".axis--x").call(xAxis);
            focus.select(".axis--y").call(yAxis);
            context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
        }

        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", this.width - margin.left - margin.right)
            .attr("height", this.height1)
            .attr("x", margin.left)
            .attr("y", 0);

        var Line_chart = svg.append("g")
            .attr("class", "focus")
            .attr("viewBox", [0, 0, this.width, this.height1])
            .attr("clip-path", "url(#clip)");

        var focus = svg.append("g")
        .attr("viewBox", [0, 0, this.width, this.height1])
        .attr("class", "focus")

        var context = svg.append("g")
            .attr("class", "context")
            .attr("viewBox", [0, 0, this.width, this.height2])
            .attr("transform", "translate(" + 0 + "," + 140 + ")");

        x2.domain(x.domain());
        y2.domain(y.domain());

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        Line_chart
            .selectAll("path")
            .data(series)
            .join("path")
            .attr("fill", ({key}) => colorScale(key))
            .attr("class", "area")
            .attr("d", area)
            .append("title")
            .text(({key}) => key);

        context
            .selectAll("path")
            .data(series)
            .join("path")
            .attr("fill", ({key}) => colorScale(key))
            .attr("class", "area")
            .attr("d", area2)
            .append("title")
            .text(({key}) => key);

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + this.height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());

        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", this.width)
            .attr("height", this.height1-margin.bottom)
            .style("fill-opacity", 0)
            .call(zoom);

    }

    render() {
        return (
            <Container fluid id={Constants.EXPLOSIONS_STACKED_AREA_CHART_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }

}

export default ExplosionsStackedAreaChart;