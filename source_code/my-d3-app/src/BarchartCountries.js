import * as d3 from "d3";
import { Component } from 'react';
import Container from 'react-bootstrap/Container';
import { Constants } from './constants/Constants';
import { LABEL } from './locale/en-us';
import { getFilteredData } from './util';

class BarchartCountries extends Component {

    width;
    height;

    componentDidMount() {
        const container = d3.select("#" + Constants.BARCHART_COUNTRIES_SVG_CONTAINER_ID);
        this.width = container.node().getBoundingClientRect().width;
        this.height = container.node().getBoundingClientRect().height;

        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (this.props.explosionsData.length !== prevProps.explosionsData.length
            || this.props.explosionsData !== prevProps.explosionsData
            || this.props.filter !== prevProps.filter
        ) {
            const svg = d3.select("#" + Constants.BARCHART_COUNTRIES_SVG_CONTAINER_ID).select("svg");
            svg.remove();
            this.drawChart();
        }
    }

    drawChart = () => {

        const {
            explosionsData,
            colorScale,
            filter,
            addToFilter,
            removeFromFilter
        } = this.props;

        const margin = ({ top: 30, right: 10, bottom: 40, left: 50 });

        const filteredData = getFilteredData(explosionsData, filter, "country");

        const data_grouped = d3.group(filteredData, d => d.country);

        let categorized_data = [];
        for (let [key, value] of data_grouped.entries()) {
            categorized_data.push({
                "category": key,
                "count": value.length
            })
        }

        const xScale = d3.scaleBand()
            .domain(categorized_data.map(d => d['category']))
            .rangeRound([margin.left, this.width - margin.right])
            .padding(0);

        const yMax = d3.max(categorized_data, d => d['count']);
        const yScale = d3.scaleSqrt()
            .domain([0, yMax])
            .range([this.height - margin.bottom, margin.top]);

        const svg = d3.select("#" + Constants.BARCHART_COUNTRIES_SVG_CONTAINER_ID)
            .append("svg")
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("font-size", "10")
            .attr("text-anchor", "end");

        this.drawAxes(svg, xScale, yScale, LABEL.COUNTRIES, LABEL.COUNTS_SQRT, this.height, this.width, margin, categorized_data.length);

        svg.append("g")
            .selectAll("rect")
            .data(categorized_data)
            .join("rect")
            .attr("fill", d => {
                if (filter.country.size === 0 || filter.country.has(d['category'])) {
                    return colorScale(d['category']);
                } else {
                    return Constants.DISABLED_COLOR;
                }
            })
            // .attr("fill-opacity", 0.6)
            .attr("x", d => xScale(d['category']) + xScale.bandwidth() / 4)
            .attr("y", d => yScale(d['count']))
            .attr("height", d => yScale(0) - yScale(d['count']))
            .attr("width", xScale.bandwidth() / 2)
            .on("click", function (e, d) {
                if (filter.country.has(d['category'])) {
                    removeFromFilter("country", d['category']);
                } else {
                    addToFilter("country", d['category']);
                }
            });

        svg.append("g")
            .selectAll("text")
            .data(categorized_data)
            .join("text")
            .text(d => d['count'])
            .attr("x", d => xScale(d['category']) + xScale.bandwidth() / 2)
            .attr("y", d => yScale(d['count']) - 4)
            .attr("font-size", "14")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("fill", d => {
                if (filter.country.size === 0 || filter.country.has(d['category'])) {
                    return colorScale(d['category']);
                } else {
                    return Constants.DISABLED_COLOR;
                }
            }).on("click", function (e, d) {
                if (filter.country.has(d['category'])) {
                    removeFromFilter("country", d['category']);
                } else {
                    addToFilter("country", d['category']);
                }
            });
    }

    drawAxes = (svg,
        xScale,
        yScale,
        xTitleTxt,
        yTitleTxt,
        height,
        width,
        margin,
        num_categories) => {

        const xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale)
                .tickSizeOuter(0)
                .tickFormat(d => {
                    if (d === "United States of America") {
                        return "USA";
                    } else if (d === "United Kingdom") {
                        return "UK";
                    } else if (d === "North Korea") {
                        return "N. Korea";
                    } else {
                        return d;
                    }
                }))
            .selectAll("text")
            // .attr("transform", `rotate(${deg})`)
            .attr("font-size", 12)
        // .attr("text-anchor", anchor)

        const xTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", (width - margin.right) / 2)
            .attr("y", height - 5)
            .attr("dy", "-.25em")
            .attr("text-anchor", "middle")
            .text(xTitleTxt)

        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale).tickSizeOuter(0))
            .attr("font-size", 10)

        const yTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", -(height - margin.bottom) / 2)
            .attr("dy", ".75em")
            .attr("y", 5)
            .attr("transform", "rotate(-90)")
            .text(yTitleTxt)

        svg.append("g")
            .call(xAxis);

        svg.call(xTitle);

        svg.append("g")
            .call(yAxis);

        svg.call(yTitle);

        svg.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .attr("font-weight", "bold")
            .attr("x", (width + margin.left) / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .text(LABEL.EXPLOSION_BY_COUNTRIES)
    }

    render() {
        return (
            <Container fluid id={Constants.BARCHART_COUNTRIES_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }

}

export default BarchartCountries;