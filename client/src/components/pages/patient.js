import React, { Component } from "react";
import { Form, Button, Container, Row, Col, Card, ListGroup, Table } from 'react-bootstrap';

import AES from 'crypto-js/aes';
import ipfs from '../../ipfs';

import "../../App.css";

import { connect } from 'react-redux';

class Upload extends Component {

  state = {
    acc: null,
    encrypted: null,
    hash: null,
    files: [],
    prescriptions: [],
    balance: 0,
    isPatient: false,
  };


  componentDidMount() {
    console.log("PROPS IN UPLOAD", this.props);
    console.log("STATE IN UPLOAD", this.state);

    var inst = this.props.state.contract;
    var token = this.props.state.tokenContract;

    this.props.state.web3.eth.getAccounts().then(function (acc) {
      console.log("ACCOUNT", acc);
      console.log(inst);
      console.log(inst.methods);
      this.setState({ acc: acc })
      console.log("STATE", this.state);
      return inst.methods.isPatient(acc.toString()).call({ from: acc.toString() });
    }.bind(this)).then(function (pat) {
      this.setState({ isPatient: pat })
      return token.methods.balanceOf(this.state.acc.toString()).call({ from: this.state.acc.toString() });
    }.bind(this)).then(function (bal) {
      this.setState({ balance: bal })
      return inst.methods.allPatientsData().call({ from: this.state.acc.toString() })
    }.bind(this)).then(function (res) {
      this.setState({ files: res });
      return inst.methods.allPrescriptions().call({ from: this.state.acc.toString() });
    }.bind(this)).then(function (presc) {
      this.setState({ prescriptions: presc });
    }.bind(this)).catch(function (err) {
      console.log("Not a Patient", err);
    })
  }

  loadHash() {


    var inst = this.props.state.contract;


    this.props.state.web3.eth.getAccounts().then(function (acc) {
      // this.sendReq(acc);
      console.log("ACCOUNT", acc);
      console.log(inst);
      console.log(inst.methods);
      this.setState({ acc: acc })
      console.log("STATE", this.state);
      return inst.methods.addFile(this.state.hash.toString()).send({ from: this.state.acc.toString() })
    }.bind(this)).then(function (res) {
      console.log("AFTER FUNCTION", res)
    }).catch(function (err) {
      console.log(err);
    })


  }

  encryptFile(f) {
    var reader = new FileReader();

    console.log("STATE IN UPLOAD", this.state);

    reader.onloadend = () => {

      console.log("RES", reader.result);

      var salt = 10;

      var r = AES.encrypt(reader.result, "qwertyuiop");

      console.log("ENCRYPTED", r);

      console.log("LINK", 'data:application/octet-stream,' + r);

      this.setState({ encrypted: r.toString() })
      console.log("AFTER SETING", this.state)

    }
    reader.readAsDataURL(f);

    setTimeout(() => {
      ipfs.files.add(Buffer(this.state.encrypted), function (err, res) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(res);
          this.setState({ hash: res[0].hash })
          console.log(this.state);
          this.loadHash();
        }
      }.bind(this))
    }, 5000);
  }

  addFile(e) {
    e.preventDefault();
    const file = this.refs.fileUpload.files[0];
    console.log(file, "\n\n");
    this.encryptFile(file);
  }

  sendFile(e) {
    e.preventDefault();
    const fileHash = this.refs.fileHash.value;
    const doctor = this.refs.docAdd.value;

    var inst = this.props.state.contract;


    this.props.state.web3.eth.getAccounts().then(function (acc) {
      // this.sendReq(acc);
      console.log("ACCOUNT", acc);
      console.log(inst);
      console.log(inst.methods);
      this.setState({ acc: acc })
      console.log("STATE", this.state);
      return inst.methods.docFee(doctor.toString()).call({ from: this.state.acc.toString() });
    }.bind(this)).then(function (fee) {
      console.log("FEE", fee);
      return inst.methods.sendFile(doctor.toString(), fileHash.toString(), fee).send({ from: this.state.acc.toString() })
    }.bind(this)).then(function (res) {
      console.log("AFTER FUNCTION", res)
    }).catch(function (err) {
      console.log("ERROR", err);
    })
  }

  render() {

    var files = this.state.files;

    console.log(files);

    var fileList = files.length == 0 ? function () {
      console.log(files.length); return (
        <Container>
          <Row>
            <Col>
              "No Data"
        </Col>
          </Row>
        </Container>)
    } : files.map(function (file, index) {
      console.log(files.length);
      return <ListGroup.Item key={index}>{file}</ListGroup.Item>
    });

    var prescription = this.state.prescriptions;

    console.log(prescription);

    var prescriptionList = prescription.length == 0 ? function () {
      console.log(prescription.length); return (
        <Container>
          <Row>
            <Col>
              "No Data"
          </Col>
          </Row>
        </Container>)
    } : prescription.map(function (file, index) {
      console.log(prescription.length);
      console.log("PRESCRIPTIONS", file)
      return <tr><td>{file[0]} </td><td>{file[1]}</td></tr>
      // return <ListGroup.Item key={index}>File: {file[0]}              Prescription: {file[1]}</ListGroup.Item>
    });

    var balance = this.state.balance;


    if (this.state.acc === null) {
      return (
        <Container>
          <Row>
            <Col>
              Loading...
            </Col>
          </Row>
        </Container>
      )
    }
    else if (this.state.isPatient === true) {

      return (

        <Container>

          <Row style={{marginBottom: 15}}>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Token Balance</Card.Title>
                  <Card.Text>
                    <ListGroup>
                      <ListGroup.Item>{balance} ETH</ListGroup.Item>
                    </ListGroup>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>ADD Data file in Excel</Card.Title>
                  <Card.Text>
                    <Form onSubmit={this.addFile.bind(this)}>
                      <a className="button browse blue">Browse     </a>
                      <input
                        type='file' label='Upload' accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf, application/docx" ref='fileUpload'
                      />
                      <Button variant="primary" type="submit">Submit</Button>
                    </Form>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

          </Row>


          <Row style={{marginBottom: 15}}>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>List All Files</Card.Title>
                  <Card.Text>
                    <ListGroup>
                      {fileList}
                    </ListGroup>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row style={{marginBottom: 15}}>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Send File to doctor</Card.Title>
                  <Card.Text>
                    <Form onSubmit={this.sendFile.bind(this)}>

                      <Form.Group controlId="fileHash">
                        <Form.Label>File Hash from above</Form.Label>
                        <Form.Control type="text" placeholder="Enter Hospital name" ref='fileHash' />
                      </Form.Group>

                      <Form.Group controlId="addressDoc">
                        <Form.Label>Doctor's Address</Form.Label>
                        <Form.Control type="text" placeholder="Enter Doctor's Address" ref='docAdd' />
                      </Form.Group>

                      <Button variant="primary" type="submit">Submit</Button>

                    </Form>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row style={{marginBottom: 15}}>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Prescriptions Sent</Card.Title>
                  <Card.Text>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>File</th>
                          <th>Prescription</th>
                        </tr>
                      </thead>
                      <tbody>
                        {prescriptionList}
                      </tbody>
                    </Table>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Container>

      );
    }
    else {
      return (
        <Container>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>You are not a patient</Card.Title>
                  <Card.Text>
                    <ListGroup>
                      <ListGroup.Item>Your Address: {this.state.acc}</ListGroup.Item>
                      <ListGroup.Item>Owner Address: {this.props.state.owner}</ListGroup.Item>
                    </ListGroup>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      )
    }
  }
}

const mapStateToProps = (state) => {
  return {
    state
  }
}

export default connect(mapStateToProps)(Upload);