import { Component } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import './App.css';
import { LABEL } from './locale/en-us';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: {},
            features: [],
        }
    }

    componentDidMount() {
        fetch("/data_info")
            .then(res => res.json())
            .then(
                (res) => {
                    this.setState({
                        data: res['rawData'],
                        features: res['features'],
                    })
                    console.log(res);
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

                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="main-col-cards" sm={12}>
                                    <Card style={{ height: "25vh" }}>

                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                        <Col className="main-col-cards" sm={3}>
                            <Card style={{ height: "50vh" }}>

                            </Card>
                        </Col>
                        <Col className="main-col-cards" sm={6}>
                            <Card style={{ height: "50vh" }}>

                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="main-col-cards" sm={3}>
                            <Card style={{ height: "49vh" }}>

                            </Card>
                        </Col>
                        <Col className="main-col-cards" sm={6}>
                            <Card style={{ height: "49vh" }}>

                            </Card>
                        </Col>
                        <Col className="main-col-cards" sm={3}>
                            <Card style={{ height: "49vh" }}>

                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}

export default App;
