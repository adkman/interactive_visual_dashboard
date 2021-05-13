import * as d3 from "d3";
import { Component } from 'react';
import Container from 'react-bootstrap/Container';
import * as topojson from "topojson-client";
import { Constants } from './constants/Constants';
import countries_data from './data/countries-110m.json';
import { getFilteredData } from './util';
import { LABEL } from "./locale/en-us";

class WorldBubbleMap extends Component {

    width;
    height;

    componentDidMount() {
        const container = d3.select("#" + Constants.WORLD_MAP_SVG_CONTAINER_ID);
        this.width = container.node().getBoundingClientRect().width;
        this.height = container.node().getBoundingClientRect().height;

        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (this.props.explosionsData.length !== prevProps.explosionsData.length
            || this.props.explosionsData !== prevProps.explosionsData
            || this.props.filter !== prevProps.filter
        ) {
            const svg = d3.select("#" + Constants.WORLD_MAP_SVG_CONTAINER_ID).select("svg");
            svg.remove();
            this.drawChart();
        }
    }

    drawChart() {

        const {
            explosionsData,
            colorScale,
            nuclearCountries,
            filter,
        } = this.props;

        const projection = d3.geoNaturalEarth1();

        const path = d3.geoPath(projection);

        const filteredData = getFilteredData(explosionsData, filter, "");

        const data = filteredData.map(d => Object.assign({}, d, {
            "position": path.centroid({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [d.longitude, d.latitude]
                }
            })
        }));

        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", zoomed);

        const countries = topojson.feature(countries_data, countries_data.objects.countries);

        const magScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.magnitude_body))
            .range([3, 15]);

        const svg = d3.select("#" + Constants.WORLD_MAP_SVG_CONTAINER_ID)
            .append("svg")
            .attr("viewBox", [0, 0, this.width, this.height])
            .style("max-height", "100%")
            .style("width", "auto");

        svg.call(zoom);

        const countriesGroup = svg.append("g");

        countriesGroup
            .append("g")
            .selectAll("path")
            .data(countries.features)
            .join("path")
            .attr("fill", d => {
                if (nuclearCountries.indexOf(d.properties.name) !== -1 &&
                    (filter.country.size === 0 || filter.country.has(d.properties.name))) {
                    return colorScale(d.properties.name);
                } else {
                    return Constants.DISABLED_COLOR;
                }
            })
            .attr("fill-opacity", d => nuclearCountries.indexOf(d.properties.name) !== -1 ? 0.3 : 0.6)
            .attr("d", path);

        countriesGroup
            .append("path")
            .datum(topojson.mesh(countries_data, countries_data.objects.countries, (a, b) => a !== b))
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-opacity", "1")
            .attr("stroke-width", "1")
            .attr("stroke-linejoin", "round")
            .attr("d", path);

        const circles = svg.append("g")
            .selectAll("circle")
            .data(data.filter(d => d.position))
            .join("circle")
            .attr("transform", d => `translate(${d.position[0]},${d.position[1]})`)
            .attr("fill", d => colorScale(d.country))
            .attr("fill-opacity", 0.25)
            .attr("stroke", d => colorScale(d.country))
            .attr("stroke-opacity", 0.5)
            .attr("stroke-width", 0.5)
            .attr("r", d => magScale(d.magnitude_body))
            .on("mouseover", function (e, d) {
                d3.select(this)
                    .attr("fill-opacity", 1);
                let tooltipGroup = d3.select(this.parentNode)
                    .append("g")
                    .attr("font-size", "11")
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "start")
                    .attr("class", "temp_bubble_text")
                    .attr("fill", colorScale(d.country));

                tooltipGroup.append("rect")
                    .attr("width", 200)
                    .attr("height", 100)
                    .attr("fill", colorScale(d.country))
                    .attr("fill-opacity", 0.2);

                tooltipGroup.append('text')
                    .text("Region:  " + d.region)
                    .attr("x", 10)
                    .attr("y", 10);
                tooltipGroup.append('text')
                    .text("Source:  " + d.source)
                    .attr("x", 10)
                    .attr("y", 20);
                tooltipGroup.append('text')
                    .text("Magnitude body:  " + d.magnitude_body)
                    .attr("x", 10)
                    .attr("y", 30);
                tooltipGroup.append('text')
                    .text("Magnitude surface:  " + d.magnitude_surface)
                    .attr("x", 10)
                    .attr("y", 40);
                tooltipGroup.append('text')
                    .text("Depth:  " + d.depth)
                    .attr("x", 10)
                    .attr("y", 50);
                tooltipGroup.append('text')
                    .text("Yield (lower):  " + d.yield_lower)
                    .attr("x", 10)
                    .attr("y", 60);
                tooltipGroup.append('text')
                    .text("Yield (upper):  " + d.yield_upper)
                    .attr("x", 10)
                    .attr("y", 70);
                tooltipGroup.append('text')
                    .text("Purpose:  " + d.purpose)
                    .attr("x", 10)
                    .attr("y", 80);
                tooltipGroup.append('text')
                    .text("Type:  " + d.type)
                    .attr("x", 10)
                    .attr("y", 90);
            }).on("mouseout", function (e, d) {
                d3.select(this)
                    .attr("fill-opacity", 0.25);
                d3.select(".temp_bubble_text").remove();
            });

        function zoomed(event) {
            const { transform } = event;
            countriesGroup.attr("transform", transform);
            countriesGroup.attr("stroke-width", 1 / transform.k);

            circles.attr("transform", d => `translate(${transform.apply(d.position)})`)
        }

        svg.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .attr("font-weight", "bold")
            .attr("x", this.width / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text(LABEL.WORLD_MAP_TITLE)

    }

    render() {
        return (
            <Container fluid id={Constants.WORLD_MAP_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }
}

export default WorldBubbleMap;