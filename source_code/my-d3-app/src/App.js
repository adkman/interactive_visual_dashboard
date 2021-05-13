import * as d3 from "d3";
import { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import './App.css';
import BarchartCountries from './BarchartCountries';
import ExplosionsStackedAreaChart from './ExplosionsStackedAreaChart';
import InventoryMultiLineChart from './InventoryMultiLineChart';
import ParallelCoordinatePlot from "./ParallelCoordinatePlot";
import StackedBarchartType from './StackedBarchartType';
import StackedHorizontalBarchartPurpose from './StackedHorizontalBarchartPurpose';
import WorldBubbleMap from './WorldBubbleMap';

class App extends Component {

    colorScale;

    constructor(props) {
        super(props);

        this.state = {
            explosionsData: [],
            explosionsFeatures: [],
            inventoryData: [],
            inventoryFeatures: [],
            nuclearCountries: [],
            filter: {
                country: new Set(),
                type: new Set(),
                purpose: new Set(),
                yearRange: [1940, 2020],
            }
        }

        this.colorScale = d3.scaleOrdinal()
            .domain(this.state.nuclearCountries)
            .range(d3.schemeSet2)
    }

    componentDidMount() {
        fetch("/data_info")
            .then(res => res.json())
            .then(
                (res) => {
                    let nuclearCountries = res["explosionsRawData"].map(d => d.country);
                    this.setState({
                        explosionsData: res["explosionsRawData"],
                        explosionsFeatures: res["explosionsFeatures"],
                        inventoryData: res["inventoryRawData"],
                        inventoryFeatures: res["inventoryFeatures"],
                        nuclearCountries: [...new Set(nuclearCountries)],
                    })
                    console.log(res);

                    this.colorScale = d3.scaleOrdinal()
                        .domain(nuclearCountries)
                        .range(d3.schemeSet2)
                }
            )
    }

    addToFilter = (key, value) => {
        let newFilter = Object.assign({}, this.state.filter)
        newFilter[key] = new Set(this.state.filter[key]);
        newFilter[key].add(value);
        console.log("new filter", newFilter, this.state.filter);
        this.setState({
            filter: newFilter
        })
    }

    addYearRangeFilter = (minVal, maxVal) => {
        let newFilter = Object.assign({}, this.state.filter)
        if (this.state.filter["yearRange"][0] !== minVal || this.state.filter["yearRange"][1] !== maxVal) {
            newFilter["yearRange"] = [0, 0];
            newFilter["yearRange"][0] = minVal;
            newFilter["yearRange"][1] = maxVal;

            console.log("new filter", newFilter, this.state.filter);
            this.setState({
                filter: newFilter
            })
        }
    }

    removeFromFilter = (key, value) => {
        let newFilter = Object.assign({}, this.state.filter)
        newFilter[key] = new Set(this.state.filter[key]);
        newFilter[key].delete(value)
        console.log("new filter", newFilter, this.state.filter);

        if (newFilter.country.size === 0 && newFilter.type.size === 0 && newFilter.purpose.size === 0) {
            newFilter["yearRange"] = [1940, 2020];
        }
        this.setState({
            filter: newFilter
        })
    }

    resetFilters = () => {
        this.setState({
            filter: {
                country: new Set(),
                type: new Set(),
                purpose: new Set(),
                yearRange: [1940, 2020],
            }
        })
    }

    render() {
        return (
            <div style={{ height: "100vh" }}>
                <Container fluid style={{ height: "inherit" }}>
                    <Row>
                        <Col sm={3}>
                            <Row>
                                <Col className="main-col-cards" sm={12}>
                                    <Card style={{ height: "25vh" }}>
                                        <BarchartCountries
                                            explosionsData={this.state.explosionsData}
                                            colorScale={this.colorScale}
                                            filter={this.state.filter}
                                            addToFilter={this.addToFilter}
                                            removeFromFilter={this.removeFromFilter}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="main-col-cards" sm={12}>
                                    <Card style={{ height: "25vh" }}>
                                        <StackedBarchartType
                                            explosionsData={this.state.explosionsData}
                                            colorScale={this.colorScale}
                                            nuclearCountries={this.state.nuclearCountries}
                                            filter={this.state.filter}
                                            addToFilter={this.addToFilter}
                                            removeFromFilter={this.removeFromFilter}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                        <Col className="main-col-cards" sm={3}>
                            <Card style={{ height: "50vh" }}>
                                <StackedHorizontalBarchartPurpose
                                    explosionsData={this.state.explosionsData}
                                    colorScale={this.colorScale}
                                    nuclearCountries={this.state.nuclearCountries}
                                    filter={this.state.filter}
                                    addToFilter={this.addToFilter}
                                    removeFromFilter={this.removeFromFilter}
                                />
                            </Card>
                        </Col>
                        <Col className="main-col-cards" sm={6}>
                            <Card style={{ height: "50vh" }}>
                                <WorldBubbleMap
                                    explosionsData={this.state.explosionsData}
                                    colorScale={this.colorScale}
                                    nuclearCountries={this.state.nuclearCountries}
                                    filter={this.state.filter}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="main-col-cards" sm={4}>
                            <Card style={{ height: "49vh" }}>
                                <ExplosionsStackedAreaChart
                                    explosionsData={this.state.explosionsData}
                                    explosionsFeatures={this.state.explosionsFeatures}
                                    colorScale={this.colorScale}
                                    nuclearCountries={this.state.nuclearCountries}
                                    filter={this.state.filter}
                                    addYearRangeFilter={this.addYearRangeFilter}
                                />
                            </Card>
                        </Col>
                        <Col className="main-col-cards" sm={4}>
                            <Card style={{ height: "49vh" }}>
                                <ParallelCoordinatePlot
                                    explosionsData={this.state.explosionsData}
                                    colorScale={this.colorScale}
                                    filter={this.state.filter}
                                />
                            </Card>
                        </Col>
                        <Col className="main-col-cards" sm={4}>
                            <Card style={{ height: "49vh" }}>
                                <InventoryMultiLineChart
                                    inventoryData={this.state.inventoryData}
                                    inventoryFeatures={this.state.inventoryFeatures}
                                    colorScale={this.colorScale}
                                    nuclearCountries={this.state.nuclearCountries}
                                    filter={this.state.filter}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Container>
                <Button variant="info" type="reset" className="btn-sq" onClick={() => this.resetFilters()}>
                    Reset Filters
                </Button>
            </div>
        );
    }
}

export default App;
