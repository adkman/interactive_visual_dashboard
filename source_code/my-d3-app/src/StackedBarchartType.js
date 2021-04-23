import * as d3 from "d3";
import Container from 'react-bootstrap/Container';
import { Component } from 'react';
import { Constants } from './constants/Constants';
import { LABEL } from './locale/en-us';

class StackedBarchartType extends Component {

    width;
    height;

    componentDidMount() {
        const container = d3.select("#" + Constants.STACKED_BARCHART_TYPE_SVG_CONTAINER_ID);
        this.width = container.node().getBoundingClientRect().width;
        this.height = container.node().getBoundingClientRect().height;

        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (this.props.explosionsData.length !== prevProps.explosionsData.length
            || this.props.explosionsData !== prevProps.explosionsData
        ) {
            const svg = d3.select("#" + Constants.STACKED_BARCHART_TYPE_SVG_CONTAINER_ID).select("svg");
            svg.remove();
            this.drawChart();
        }
    }

    drawChart = () => {

        const { explosionsData, colorScale, nuclearCountries } = this.props;

        const margin = ({ top: 20, right: 10, bottom: 50, left: 50 });

        let dataMap = new Map();
        for (let i = 0; i < explosionsData.length; i++) {
            if (dataMap.has(explosionsData[i].type)) {
                let country = explosionsData[i].country;
                let typeData = dataMap.get(explosionsData[i].type);
                if (!!typeData[country]) {
                    typeData[country] += 1;
                } else {
                    typeData[country] = 1;
                }
                dataMap.set(explosionsData[i].type, typeData);
            } else {
                let country = explosionsData[i].country;
                let typeData = {
                    "name": explosionsData[i].type,
                    [country]: 1,
                }
                dataMap.set(explosionsData[i].type, typeData);
            }
        }

        const data_grouped = Array.from(dataMap.values());

        const data_stacked = d3.stack()
            .keys(nuclearCountries)
            (data_grouped)
            .map(d => (d.forEach(v => v.key = d.key), d));

        console.log("Stacked: Type data", data_stacked);

        const xScale = d3.scaleBand()
            .domain(Array.from(dataMap.keys()))
            .rangeRound([margin.left, this.width - margin.right])
            .padding(0.1);

        const yMax = d3.max(data_stacked, d => d3.max(d, d => d[1]));
        const yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([this.height - margin.bottom, margin.top]);

        const svg = d3.select("#" + Constants.STACKED_BARCHART_TYPE_SVG_CONTAINER_ID)
            .append("svg")
            .attr("viewBox", [0, 0, this.width, this.height])
            .attr("font-size", "10")
            .attr("text-anchor", "end");

        this.drawAxes(svg, xScale, yScale, LABEL.TYPE, LABEL.COUNTS, this.height, this.width, margin, data_stacked.length);

        svg.append("g")
            .selectAll("g")
            .data(data_stacked)
            .join("g")
            .attr("fill", d => colorScale(d.key))
            .attr("fill-opacity", 0.6)
            .selectAll("rect")
            .data(d => d)
            .join("rect")
            .attr("x", d => xScale(d.data.name))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth())
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

        let deg = num_categories >= 8 ? -30 : 0;
        let anchor = num_categories >= 8 ? "end" : "middle";
        const xAxis = g => g
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale)
                .tickSizeOuter(0))
            .selectAll("text")
            .attr("transform", `rotate(${deg})`)
            .attr("font-size", 12)
            .attr("text-anchor", anchor)

        const xTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", (width - margin.right) / 2)
            .attr("y", height)
            .attr("dy", "-.25em")
            .attr("text-anchor", "middle")
            .text(xTitleTxt)

        const yAxis = g => g
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(yScale))
            .attr("font-size", 9)

        const yTitle = g => g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 14)
            .attr("x", -(height - margin.bottom) / 2)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text(yTitleTxt)

        svg.append("g")
            .call(xAxis);

        svg.call(xTitle);

        svg.append("g")
            .call(yAxis);

        svg.call(yTitle);
    }

    render() {
        return (
            <Container fluid id={Constants.STACKED_BARCHART_TYPE_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }

}

export default StackedBarchartType;