import * as d3 from "d3";
import { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import './App.css';
import BarchartCountries from './BarchartCountries';
import ExplosionsStackedAreaChart from './ExplosionsStackedAreaChart';
import InventoryMultiLineChart from './InventoryMultiLineChart';
import StackedBarchartType from './StackedBarchartType';
import StackedHorizontalBarchartType from './StackedHorizontalBarchartType';
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
        }

        this.colorScale = d3.scaleOrdinal()
            .domain(this.state.explosionsData.map(d => d.country))
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
                        .range(d3.schemeCategory10)
                }
            )
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
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                        <Col className="main-col-cards" sm={3}>
                            <Card style={{ height: "50vh" }}>
                                <StackedHorizontalBarchartType
                                    explosionsData={this.state.explosionsData}
                                    colorScale={this.colorScale}
                                    nuclearCountries={this.state.nuclearCountries}
                                />
                            </Card>
                        </Col>
                        <Col className="main-col-cards" sm={6}>
                            <Card style={{ height: "50vh" }}>
                                <WorldBubbleMap
                                    explosionsData={this.state.explosionsData}
                                    colorScale={this.colorScale}
                                    nuclearCountries={this.state.nuclearCountries}
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
                                />
                            </Card>
                        </Col>
                        <Col className="main-col-cards" sm={4}>
                            <Card style={{ height: "49vh" }}>

                            </Card>
                        </Col>
                        <Col className="main-col-cards" sm={4}>
                            <Card style={{ height: "49vh" }}>
                                <InventoryMultiLineChart
                                    inventoryData={this.state.inventoryData}
                                    inventoryFeatures={this.state.inventoryFeatures}
                                    colorScale={this.colorScale}
                                    nuclearCountries={this.state.nuclearCountries}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;
