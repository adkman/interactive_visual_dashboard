import * as d3 from "d3";
import { Component } from 'react';
import Container from 'react-bootstrap/Container';
import { Constants } from './constants/Constants';
import { LABEL } from "./locale/en-us";
import "./ParallelCoordinatePlot.css";
import { getFilteredData, scaleBandInvert } from './util';

class ParallelCoordinatePlot extends Component {

    width;
    height;

    componentDidMount() {
        const container = d3.select("#" + Constants.PCP_SVG_CONTAINER_ID);
        this.width = container.node().getBoundingClientRect().width;
        this.height = container.node().getBoundingClientRect().height;

        this.drawChart();
    }

    componentDidUpdate(prevProps) {
        if (this.props.explosionsData.length !== prevProps.explosionsData.length
            || this.props.explosionsData !== prevProps.explosionsData
            || this.props.filter.country !== prevProps.filter.country
            || this.props.filter.purpose !== prevProps.filter.purpose
            || this.props.filter.yearRange !== prevProps.filter.yearRange
        ) {
            const svg = d3.select("#" + Constants.PCP_SVG_CONTAINER_ID).select("svg");
            svg.remove();
            this.drawChart();
        }
    }

    drawChart() {
        const {
            explosionsData,
            colorScale,
            filter,
            addRangeFilter,
            addToFilter,
            removeFromFilter,
        } = this.props;

        const margin = ({ top: 40, right: 20, bottom: 20, left: 40 });

        const filteredData = getFilteredData(explosionsData, filter, "");

        const dimensions = [
            {
                name: "magnitude_body",
                type: Constants.NUMERICAL_FEATURE
            },
            {
                name: "magnitude_surface",
                type: Constants.NUMERICAL_FEATURE
            },
            {
                name: "depth",
                type: Constants.NUMERICAL_FEATURE
            },
            {
                name: "yield_lower",
                type: Constants.NUMERICAL_FEATURE
            },
            {
                name: "yield_upper",
                type: Constants.NUMERICAL_FEATURE
            },
            // {
            //     name: "purpose",
            //     type: Constants.CATEGORICAL_FEATURE
            // },
            {
                name: "type",
                type: Constants.CATEGORICAL_FEATURE
            },
            // {
            //     name: "source",
            //     type: Constants.CATEGORICAL_FEATURE
            // },
        ];

        const xScale = d3.scalePoint()
            .domain(dimensions.map((dim) => dim.name))
            .rangeRound([margin.left, this.width - margin.right]);

        const yScales = new Map(Array.from(dimensions, dim => {
            let scale = dim.type === Constants.NUMERICAL_FEATURE
                ? d3.scaleLinear()
                    .domain(d3.extent(filteredData, d => d[dim.name]))
                    .range([this.height - margin.bottom, margin.top])
                    .nice()
                : d3.scaleBand()
                    .domain(filteredData.map((d) => d[dim.name]).sort())
                    .rangeRound([margin.top, this.height - margin.bottom])
            return [dim.name, scale];
        }));

        let line = d3.line()
            .defined(([, value]) => value != null)

        const svg = d3.select("#" + Constants.PCP_SVG_CONTAINER_ID)
            .append("svg")
            .attr("viewBox", [0, 0, this.width, this.height]);

        const path = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 0.4)
            .selectAll("path")
            .data(filteredData.slice())
            .join("path")
            .attr("stroke", d => colorScale(d.country))
            .attr("d", d => line(d3.cross(dimensions, [d], (dim, d) => {
                let tx = xScale(dim.name);
                let ty = null;
                if (dim.type === Constants.NUMERICAL_FEATURE) {
                    ty = yScales.get(dim.name)(d[dim.name])
                } else {
                    ty = yScales.get(dim.name)(d[dim.name]) + yScales.get(dim.name).bandwidth() / 2;
                }
                return [tx, ty]
            })));

        path.append("title")
            .text(LABEL.PARALLEL_COORDINATE_PLOT);

        svg.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .attr("font-weight", "bold")
            .attr("x", (this.width + margin.left) / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .text(LABEL.PARALLEL_COORDINATE_PLOT)

        const brush = d3.brushY()
            .extent([
                [-10, margin.top],
                [10, this.height - margin.bottom]
            ])
            .on("start", brushStart)
            .on("brush end", brushed);

        let dragging = {};
        let self = this;
        const drag = d3.drag()
            .subject((e, dim) => { return { x: xScale(dim.name) } })
            .on("start", function (e, dim) {
                dragging[dim.name] = xScale(dim.name);
                path.attr("visibility", "hidden");
            })
            .on("drag", function (e, dim) {
                dragging[dim.name] = Math.min(self.width - margin.right, Math.max(margin.left, e.x));
                dimensions.sort((a, b) => position(a) - position(b));
                xScale.domain(dimensions.map((dim) => dim.name));
                g.attr("transform", (dim) => `translate(${position(dim)})`);
            })
            .on("end", function (e, dim) {
                delete dragging[dim.name];
                transition(d3.select(this)).attr("transform", `translate(${xScale(dim.name)})`);
                transition(path).attr("d", path_trace);
                path.attr("visibility", "visible");
            });

        var g = svg
            .selectAll(".dimension")
            .data(dimensions)
            .join("g")
            .attr("class", "dimension")
            .attr("transform", dim => `translate(${xScale(dim.name)}, 0)`)
            .call(drag);

        g.append("g")
            .attr("class", "axis")
            .each(function (dim) { d3.select(this).call(d3.axisLeft(yScales.get(dim.name))) })
            .append("text")
            .attr("x", 0)
            .attr("y", margin.top - 8)
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(0)")
            .attr("fill", "currentColor")
            .text(dim => dim.name);

        g.call(g => g.selectAll("text")
            .clone(true).lower()
            .attr("fill", "none")
            .attr("stroke-width", 5)
            .attr("stroke-linejoin", "round")
            .attr("stroke", "white"));

        g.append("g")
            .attr("class", "brush")
            .each(function (dim) {
                d3.select(this).call(brush);
            })
            .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);

        function position(dim) {
            var v = dragging[dim.name];
            return v == null ? xScale(dim.name) : v;
        }

        function transition(g) {
            return g.transition().duration(500);
        }

        // Returns the path for a given data point.
        function path_trace(d) {
            return line(dimensions.map((dim) => {
                var v = dragging[dim.name];
                var tx = v == null ? xScale(dim.name) : v;
                if (dim.type === Constants.NUMERICAL_FEATURE) {
                    return [tx, yScales.get(dim.name)(d[dim.name])];
                } else {
                    return [tx, yScales.get(dim.name)(d[dim.name]) + yScales.get(dim.name).bandwidth() / 2];
                }
            }));
        }

        const selections = new Map();

        function brushStart(event) {
            event.sourceEvent.stopPropagation();
        }

        function brushed({ selection }, dim) {
            let key = dim.name;
            if (selection === null) {
                selections.delete(key);
                if (dim.type === Constants.NUMERICAL_FEATURE) {
                    addRangeFilter(key, []);
                // } else {
                //     if (!!selections.get(key)) {
                //         removeFromFilter(key, selections.get(key)[0]);
                //     }
                }
            } else {
                if (dim.type === Constants.NUMERICAL_FEATURE) {
                    selections.set(key, selection.map(yScales.get(key).invert));
                    addRangeFilter(key, selections.get(key).slice().reverse());
                } else {
                    selections.set(key, selection.map(scaleBandInvert(yScales.get(key))));
                    // addToFilter(key, selections.get(key)[0]);
                }
            }
            const selected = [];
            path.each(function (d, i) {
                const active = Array.from(selections).every(([key, [max, min]]) => d[key] >= min && d[key] <= max);
                d3.select(this).style("stroke", active ? colorScale(d.country) : Constants.DISABLED_COLOR);
                if (active) {
                    d3.select(this).raise();
                    selected.push(d);
                }
            });
            svg.property("value", selected).dispatch("input");
        }
    }

    render() {
        return (
            <Container fluid id={Constants.PCP_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }
}

export default ParallelCoordinatePlot;