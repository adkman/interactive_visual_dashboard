import * as d3 from "d3";
import Container from 'react-bootstrap/Container';
import { Component } from 'react';
import { Constants } from './constants/Constants';
import { LABEL } from './locale/en-us';

class ExplosionsStackedAreaChart extends Component {

    width;
    height;

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

        console.log("start")
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

        const y = d3.scaleLinear()
            .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]).nice()
            .range([this.height - margin.bottom, margin.top])

        const area = d3.area()
            .x(d => x(d.data.Year))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))

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
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove())
            .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))        
    
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

        svg.append("g")
            .selectAll("path")
            .data(series)
            .join("path")
            .attr("fill", ({key}) => colorScale(key))
            .attr("d", area)
            .append("title")
            .text(({key}) => key);
        
        svg.append("g")
            .call(xAxis);
        
        svg.call(xTitle);

        svg.append("g")
            .call(yAxis);
        
        svg.call(yTitle);

    }

    render() {
        return (
            <Container fluid id={Constants.EXPLOSIONS_STACKED_AREA_CHART_SVG_CONTAINER_ID} style={{ height: "100%", padding: 0 }} />
        );
    }

}

export default ExplosionsStackedAreaChart;