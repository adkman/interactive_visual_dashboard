import * as d3 from "d3";
import { Component } from 'react';
import Container from 'react-bootstrap/Container';
import { Constants } from './constants/Constants';
import { LABEL } from './locale/en-us';
import { getFilteredData } from './util';

class StackedHorizontalBarchartPurpose extends Component {

    width;
    height;

    componentDidMount() {
        const container = d3.select("#" + Constants.STACKED_HORIZONTAL_BARCHART_TYPE_SVG_CONTAINER_ID);
        this.width = container.node().getBoundingClientRect().width;
        this.height = container.node().getBoundingClientRect().height;

        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (this.props.explosionsData.length !== prevProps.explosionsData.length
            || this.props.explosionsData !== prevProps.explosionsData
            || this.props.filter !== prevProps.filter
        ) {
            const svg = d3.select("#" + Constants.STACKED_HORIZONTAL_BARCHART_TYPE_SVG_CONTAINER_ID).select("svg");
            svg.remove();
            this.drawChart();
        }
    }

    drawChart = () => {

        const {
            explosionsData,
            colorScale,
            nuclearCountries,
            filter,
            addToFilter,
            removeFromFilter
        } = this.props;

        const margin = ({ top: 60, right: 35, bottom: 20, left: 55 });

        const filteredData = getFilteredData(explosionsData, filter, "purpose");

        let dataMap = new Map();
        for (let i = 0; i < filteredData.length; i++) {
            let purposes = filteredData[i].purpose.split("/");
            for (let j = 0; j < purposes.length; j++) {
                if (dataMap.has(purposes[j])) {
                    let purpose = dataMap.get(purposes[j]);
                    purpose["totalCount"] += 1;
                    purpose[filteredData[i].country] += 1;
                    dataMap.set(purposes[j], purpose);
                } else {
                    let purpose = {
                        "name": purposes[j],
                        "totalCount": 1,
                    }
                    for (const country of nuclearCountries) {
                        purpose[country] = 0;
                    }
                    purpose[filteredData[i].country] = 1;
                    dataMap.set(purposes[j], purpose);
                }
            }
        }

        const data_grouped = Array.from(dataMap.values());

        const data_stacked = d3.stack()
            .keys(nuclearCountries)
            (data_grouped)
            .map(d => (d.forEach(v => v.key = d.key), d));

        const xMax = d3.max(data_stacked, d => d3.max(d, d => d[1]));
        const xScale = d3.scaleLinear()
            .domain([0, xMax])
            .range([margin.left, this.width - margin.right]);

        const yScale = d3.scaleBand()
            .domain(Array.from(dataMap.keys()))
            .rangeRound([this.height - margin.bottom, margin.top])
            .padding(0.1);


        const svg = d3.select("#" + Constants.STACKED_HORIZONTAL_BARCHART_TYPE_SVG_CONTAINER_ID)
            .append("svg")
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("font-size", "10")
            .attr("text-anchor", "end");

        this.drawAxes(svg, xScale, yScale, LABEL.COUNTS, LABEL.PURPOSE, this.height, this.width, margin, data_stacked.length);

        svg.append("g")
            .selectAll("g")
            .data(data_stacked)
            .join("g")
            // .attr("fill-opacity", 0.6)
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("fill", d => {
                if (filter.purpose.size === 0 || filter.purpose.has(d.data.name)) {
                    return colorScale(d.key);
                } else {
                    return Constants.DISABLED_COLOR;
                }
            })
            .attr("x", d => xScale(d[0]) + 1)
            .attr("y", d => yScale(d.data.name))
            .attr("width", d => xScale(d[1]) - xScale(d[0]))
            .attr("height", yScale.bandwidth())
            .on("click", function (e, d) {
                if (filter.purpose.has(d.data.name)) {
                    removeFromFilter("purpose", d.data.name);
                } else {
                    addToFilter("purpose", d.data.name);
                }
            });

        svg.append("g")
            .selectAll("text")
            .data(data_grouped)
            .join("text")
            .text(d => d.totalCount)
            .attr("x", d => xScale(d.totalCount) + 2)
            .attr("y", d => yScale(d.name) + yScale.bandwidth() / 2 + 3)
            .attr("font-size", "12")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start")
            .on("click", function (e, d) {
                if (filter.purpose.has(d.name)) {
                    removeFromFilter("purpose", d.name);
                } else {
                    addToFilter("purpose", d.name);
                }
            });
        // .on("mouseover", function (e, d) {
        //     d3.select(this)
        //         .attr("fill-opacity", 1);
        //     d3.select(this.parentNode)
        //         .append('text')
        //         .text(d['count'])
        //         .attr("x", xScale(d['category']) + xScale.bandwidth() / 2)
        //         .attr("y", yScale(d['count']) - 4)
        //         .attr("font-size", "14")
        //         .attr("font-weight", "bold")
        //         .attr("text-anchor", "middle")
        //         .attr("id", "temp_bar_chart_val")
        //         .attr("fill", colorScale(d['category']));
        // }).on("mouseout", function (e, d) {
        //     d3.select(this)
        //         .attr("fill-opacity", 0.6);
        //     d3.select("#temp_bar_chart_val").remove();
        // });
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
            .attr("transform", `translate(0,${margin.top})`)
            .call(d3.axisTop(xScale)
                .tickSizeOuter(0));

        const xTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", (width - margin.left) / 2)
            .attr("y", margin.top - 20)
            .attr("dy", "-.25em")
            .attr("text-anchor", "middle")
            .text(xTitleTxt)

        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("font-size", 10)

        const yTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", -(height - margin.bottom) / 2)
            .attr("y", 10)
            .attr("dy", ".75em")
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
            .text(LABEL.EXPLOSION_BY_PURPOSE)
    }

    render() {
        return (
            <Container fluid id={Constants.STACKED_HORIZONTAL_BARCHART_TYPE_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }

}

export default StackedHorizontalBarchartPurpose;