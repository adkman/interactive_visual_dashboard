import * as d3 from "d3";
import { Component } from 'react';
import Container from 'react-bootstrap/Container';
import { Constants } from './constants/Constants';
import { LABEL } from './locale/en-us';
import { getFilteredData } from './util';

class InventoryStackedAreaChart extends Component {

    width;
    height;

    componentDidMount() {
        const container = d3.select("#" + Constants.INVENTORY_MULTILINE_CHART_SVG_CONTAINER_ID);
        this.width = container.node().getBoundingClientRect().width;
        this.height = container.node().getBoundingClientRect().height;
        this.drawChart();
    }

    componentDidUpdate(prevProps) {

        if (
            this.props.inventoryData !== prevProps.inventoryData
            || this.props.inventoryFeatures !== prevProps.inventoryFeatures
            || this.props.filter !== prevProps.filter
        ) {
            const svg = d3.select("#" + Constants.INVENTORY_MULTILINE_CHART_SVG_CONTAINER_ID).select("svg");
            svg.remove();
            this.drawChart();
        }
    }

    drawChart = () => {

        const {
            inventoryData,
            inventoryFeatures,
            colorScale,
            filter,
        } = this.props;

        if (inventoryData.length === 0 || inventoryFeatures.length === 0) {
            return
        }
        const margin = ({ top: 30, right: 20, bottom: 40, left: 60 });

        const filteredData = getFilteredData(inventoryData, filter, "");

        let series = []

        const year = inventoryFeatures[0];
        const countries = filter.country.size === 0
            ? inventoryFeatures.slice(1)
            : inventoryFeatures.slice(1).filter(d => filter.country.has(d))
        for (let idx in countries) {
            let country = countries[idx]
            let temp = filteredData.map((d) => { return d[country] })
            series.push({ name: country, values: temp })
        }

        var dates = filteredData.map((d) => { return d[year] })
        const data = {
            series: series,
            dates: dates
        }

        const line = d3.line()
            .defined(d => !isNaN(d))
            .x((d, i) => x(data.dates[i]))
            .y(d => y(d))


        const x = d3.scaleLinear()
            .domain(d3.extent(data.dates))
            .range([margin.left, this.width - margin.right])

        const y = d3.scaleSqrt()
            .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
            .range([this.height - margin.bottom, margin.top])

        const xAxis = g => g
            .attr("transform", `translate(0,${this.height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(this.width / 80).tickSizeOuter(0))

        const xTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", (this.width + margin.left) / 2)
            .attr("y", this.height)
            .attr("dy", "-.25em")
            .attr("text-anchor", "middle")
            .text(LABEL.YEAR)

        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).ticks(this.height / 40).tickSizeOuter(0))
        // .call(g => g.select(".domain").remove())
        // .call(g => g.select(".tick:last-of-type text").clone()
        // .attr("x", 3)
        // .attr("text-anchor", "start")
        // .attr("font-weight", "bold")
        // .text(data.y)
        // )

        const yTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", -(this.height - margin.bottom) / 2)
            .attr("dy", "1em")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text(LABEL.NUCLEAR_STOCKPILE)

        const svg = d3.select("#" + Constants.INVENTORY_MULTILINE_CHART_SVG_CONTAINER_ID)
            .append("svg")
            .attr("viewBox", [0, 0, this.width, this.height]);

        svg.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .attr("font-weight", "bold")
            .attr("x", (this.width + margin.left) / 2)
            .attr("y", margin.top - 5)
            .attr("text-anchor", "middle")
            .text(LABEL.NUCLEAR_STOCKPILE_TREND)

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .selectAll("path")
            .data(data.series)
            .join("path")
            .attr("stroke", ({ name }) => colorScale(name))
            .style("mix-blend-mode", "multiply")
            .attr("d", d => line(d.values));

        // function hover(svg, path) {

        //     // if ("ontouchstart" in document) svg
        //     //     .style("-webkit-tap-highlight-color", "transparent")
        //     //     .on("touchmove", moved)
        //     //     .on("touchstart", entered)
        //     //     .on("touchend", left)
        //     // else 
        //     svg
        //         .on("mousemove", moved)
        //         .on("mouseenter", entered)
        //         .on("mouseleave", left);

        //     const dot = svg.append("g")
        //         .attr("display", "none");

        //     dot.append("circle")
        //         .attr("r", 2.5);

        //     dot.append("text")
        //         .attr("font-family", "sans-serif")
        //         .attr("font-size", 10)
        //         .attr("text-anchor", "middle")
        //         .attr("y", -8);

        //     function moved(event) {
        //         event.preventDefault();
        //         const pointer = d3.pointer(event, this);
        //         const xm = x.invert(pointer[0]);
        //         const ym = y.invert(pointer[1]);
        //         const i = d3.bisectCenter(data.dates, xm);
        //         const s = d3.least(data.series, d => Math.abs(d.values[i] - ym));
        //         path.attr("stroke", d => d === s ? null : "#ddd").filter(d => d === s).raise();
        //         dot.attr("transform", `translate(${x(data.dates[i])},${y(s.values[i])})`);
        //         dot.select("text").text(s.name);
        //     }

        //     function entered() {
        //         path.style("mix-blend-mode", null).attr("stroke", "#ddd");
        //         dot.attr("display", null);
        //     }

        //     function left() {
        //         path.style("mix-blend-mode", "multiply").attr("stroke", null);
        //         dot.attr("display", "none");
        //     }
        // }

        //TODO: HOVER 
        // svg.call(hover, path);
        const yGrid = (g) => g
            .attr('class', 'grid-lines')
            .selectAll('line')
            .data(y.ticks())
            .join('line')
            .attr('x1', margin.left)
            .attr('x2', this.width - margin.right)
            .attr('y1', d => y(d))
            .attr('y2', d => y(d))

        svg.append("g")
            .call(xAxis);

        svg.call(xTitle);

        svg.append("g")
            .call(yAxis);

        svg.call(yTitle);

        svg.append('g')
            .call(yGrid)

        svg.append("rect")
            .attr("x", x(2014))
            .attr("y", margin.top)
            .attr("width", this.width - x(2014) - margin.right)
            .attr("height", this.height - margin.top - margin.bottom)
            .style("fill-opacity", 0.09)

        svg.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", x(2014) + (this.width - x(2014) - margin.right)/2)
            .attr("y", margin.top*2)
            .attr("dy", "-.25em")
            .attr("text-anchor", "middle")
            .text(LABEL.PREDICTIONS)

    }

    render() {
        return (
            <Container fluid id={Constants.INVENTORY_MULTILINE_CHART_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }

}

export default InventoryStackedAreaChart;