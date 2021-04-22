import * as d3 from "d3";
import * as topojson from "topojson-client";
import { Component } from 'react';
import Container from 'react-bootstrap/Container';
import { Constants } from './constants/Constants';
import countries_data from './data/countries-110m.json';

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
            || this.props.features !== prevProps.features
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
        } = this.props;

        const projection = d3.geoNaturalEarth1();

        const path = d3.geoPath(projection);

        const data = explosionsData.map(d => Object.assign({}, d, {
            "position": path.centroid({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [d.longitude, d.latitude]
                }
            })
        }));

        // const land = topojson.feature(land_data, land_data.objects.land);

        const countries = topojson.feature(countries_data, countries_data.objects.countries);

        const magScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.magnitude_body))
            .range([3, 15]);

        const svg = d3.select("#" + Constants.WORLD_MAP_SVG_CONTAINER_ID)
            .append("svg")
            .attr("viewBox", [0, 0, this.width, this.height])
            .style("max-height", "100%")
            .style("width", "auto");

        const countriesGroup = svg.append("g");

        countriesGroup
            .append("g")
            .selectAll("path")
            .data(countries.features)
            .join("path")
            .attr("fill", d => nuclearCountries.indexOf(d.properties.name) !== -1 ? colorScale(d.properties.name) :'#EBEBEF')
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

        svg.append("g")
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
                d3.select(this.parentNode)
                    .append('text')
                    .text(d.magnitude_body + " mb")
                    .attr("x", d.position[0])
                    .attr("y", d.position[1] + 30)
                    .attr("font-size", "12")
                    .attr("font-weight", "bold")
                    .attr("text-anchor", "middle")
                    .attr("id", "temp_bubble_text")
                    .attr("fill", colorScale(d.country));
            }).on("mouseout", function (e, d) {
                d3.select(this)
                    .attr("fill-opacity", 0.25);
                d3.select("#temp_bubble_text").remove();
            });

    }

    render() {
        return (
            <Container fluid id={Constants.WORLD_MAP_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }
}

export default WorldBubbleMap;