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
    files: null,
    balance: 0,
    isDoctor: false,
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
      return inst.methods.isDoc(acc.toString()).call({ from: acc.toString() });
    }.bind(this)).then(function (doc) {
      this.setState({ isDoctor: doc })
      return token.methods.balanceOf(this.state.acc.toString()).call({ from: this.state.acc.toString() });
    }.bind(this)).then(function (bal) {
      this.setState({ balance: bal })
      return inst.methods.allPatient().call({ from: this.state.acc.toString() })
    }.bind(this)).then(function (res) {
      this.setState({ files: res });
    }.bind(this)).catch(function (err) {
      console.log("Not a Doctor", err);
    })
  }

  loadHash() {


    var inst = this.props.state.contract;
    var patient = this.refs.patientAdd.value;
    var patientFile = this.refs.patientFileHash.value;


    this.props.state.web3.eth.getAccounts().then(function (acc) {
      // this.sendReq(acc);
      console.log("ACCOUNT", acc);
      console.log(inst);
      console.log(inst.methods);
      this.setState({ acc: acc })
      console.log("STATE", this.state);
      return inst.methods.sendPrescription(patient.toString(), patientFile.toString(), this.state.hash.toString()).send({ from: this.state.acc.toString() })
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
      // var b = bcrypt.hash(reader.result, salt, function(err, hash){
      //     if(err){
      //         console.log(err);
      //     }
      //     else{
      //         this.setState({bcryptHash: hash});
      //     }
      // })

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
    }, 10000);
  }

  addFile(e) {
    e.preventDefault();
    const file = this.refs.fileUpload.files[0];
    console.log(file, "\n\n");
    this.encryptFile(file);
  }

  changeFee(e) {
    e.preventDefault();
    const fee = this.refs.doctorNewFee.value;

    var inst = this.props.state.contract;


    this.props.state.web3.eth.getAccounts().then(function (acc) {
      // this.sendReq(acc);
      console.log("ACCOUNT", acc);
      console.log(inst);
      console.log(inst.methods);
      this.setState({ acc: acc })
      console.log("STATE", this.state);
      return inst.methods.changeFee(fee.toString()).send({ from: this.state.acc.toString() })
    }.bind(this)).then(function (res) {
      console.log("AFTER FUNCTION", res)
    }).catch(function (err) {
      console.log(err);
    })

  }

  render() {

    var balance = this.state.balance;
    console.log("DOC FILES", this.state.files);
    var patientAndFileList;
    var fileList;
    if (this.state.files !== null) {
      // console.log("KEYS", Object.keys(this.state.files));
      // console.log("VALUES", Object.values(this.state.files));
      // console.log("First", Object.keys(this.state.files)[0]);
      // console.log("Next", Object.keys(this.state.files)[1]);
      // console.log("Next", this.state.files[Object.keys(this.state.files)[0]]);
      // console.log("Next", this.state.files[Object.keys(this.state.files)[1]]);
      // console.log("Next", this.state.files[Object.keys(this.state.files)[1][0]]);
      // console.log("VALUES", Object.values(this.state.files));

      var PATIENTS = Object.values(this.state.files[0])
      var DOCUMENTS = Object.values(this.state.files[1])

      var uniquePatient = PATIENTS.filter(function (item, pos) {
        return PATIENTS.indexOf(item) == pos;
      })

      var uniqueDocuments = DOCUMENTS.map(JSON.stringify).reverse().filter(function (e, i, a) {
        return a.indexOf(e, i + 1) === -1;
      }).reverse().map(JSON.parse)

      // var uniqueDocuments = DOCUMENTS.filter(function (item, pos) {
      //   return DOCUMENTS.indexOf(item) == pos;
      // })



      // console.log("PATIENTS", uniquePatient);
      // console.log("DOCUMENTS", uniqueDocuments);
      // console.log("DOCUMENTS", uniqueDocuments[0]);
      // console.log("DOCUMENTS", uniqueDocuments[1]);
      // console.log("DOCUMENTS", uniqueDocuments[2]);

      // var FILES = {};
      // for (var a in uniqueDocuments) {
      //   FILES[uniquePatient[a]] = uniqueDocuments[a];
      // }

      // console.log("FILES", FILES);

      // fileList = uniqueDocuments.length == 0 ? function () { console.log(uniqueDocuments.length); return <div>"No Data"</div> } : uniqueDocuments.map(function (file, index) {
      //   console.log(uniquePatient.length);
      //   return (uniqueDocuments[index].map(function (hash) {


      //     return <li>{hash}</li>
      //   }))

      // });

      patientAndFileList = uniquePatient.length == 0 ? function () {
        console.log(uniquePatient.length); return (
          <Container>
            <Row>
              <Col>
                "No Data"
        </Col>
            </Row>
          </Container>)
      } :
        uniquePatient.map(function (file, index) {
          console.log(uniquePatient.length);
          console.log("GETTING LENGTH");
          return (
            uniqueDocuments[index].map(function (hash, idx) {
              console.log("DOC RETURN");
              return <tr><td>{file} </td><td>{hash}</td></tr>
              // return <div key={index}><p> Patient Address : {file},</p><p> Shared File : {hash}</p> <hr /> </div>
            })
          )

        });

    };


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
    else if (this.state.isDoctor === true) {

      return (

        <Container>

          <Row style={{ marginBottom: 15 }}>
            <Col md={{ span: 3 }}>
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
                  <Card.Title>Change fee</Card.Title>
                  <Card.Text>
                    <Form onSubmit={this.changeFee.bind(this)}>

                      <Form.Group controlId="fee">
                        <Form.Label>Your new fee</Form.Label>
                        <Form.Control type="text" placeholder="Enter your fee amount" ref='doctorNewFee' />
                      </Form.Group>

                      <Button variant="primary" type="submit">Submit</Button>

                    </Form>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

          </Row>


          <Row style={{ marginBottom: 15 }}>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Add Prescription for the patient</Card.Title>
                  <Card.Text>
                    <Form onSubmit={this.addFile.bind(this)}>

                      <Form.Group controlId="addressPat">
                        <Form.Label>Patient's Address</Form.Label>
                        <Form.Control type="text" placeholder="Enter Patient's Address" ref='patientAdd' />
                      </Form.Group>

                      <Form.Group controlId="patientFile">
                        <Form.Label>Patient's File Hash</Form.Label>
                        <Form.Control type="text" placeholder="Enter File Hash" ref='patientFileHash' />
                      </Form.Group>

                      <a className="button browse blue">Browse  </a>
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

          <Row style={{ marginBottom: 15 }}>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>List All Files</Card.Title>
                  <Card.Text>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Files</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientAndFileList}
                      </tbody>
                    </Table>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Container>

        // <div style={{ marginLeft: "10px", paddingRight: "50px" }}>
        //   <h2>Token Balance</h2>
        //   <div>
        //     {balance}
        //   </div>

        //   <h2>Change fee</h2>
        //   <Form onSubmit={this.changeFee.bind(this)}>

        //     <Form.Group controlId="fee">
        //       <Form.Label>Your new fee</Form.Label>
        //       <Form.Control type="text" placeholder="Enter your fee amount" ref='doctorNewFee' />
        //     </Form.Group>

        //     <Button variant="primary" type="submit">Submit</Button>

        //   </Form>

        //   <h2>Add Prescription for the patient</h2>
        //   <Form onSubmit={this.addFile.bind(this)}>

        //     <Form.Group controlId="addressPat">
        //       <Form.Label>Patient's Address</Form.Label>
        //       <Form.Control type="text" placeholder="Enter Patient's Address" ref='patientAdd' />
        //     </Form.Group>

        //     <Form.Group controlId="patientFile">
        //       <Form.Label>Patient's File Hash</Form.Label>
        //       <Form.Control type="text" placeholder="Enter File Hash" ref='patientFileHash' />
        //     </Form.Group>

        //     <a className="button browse blue">Browse</a>
        //     <input
        //       type='file' label='Upload' accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf, application/docx" ref='fileUpload'
        //     />

        //     <Button variant="primary" type="submit">Submit</Button>

        //   </Form>

        //   <h2>List All Files</h2>
        //   <div>
        //     <ul>
        //       <hr />
        //       {patientAndFileList}
        //       {/* {fileList} */}
        //     </ul>
        //   </div>

        // </div>

      );
    }
    else {
      return (
        <div style={{ marginLeft: "10px", paddingRight: "50px" }}>
          <h2>You are not a Doctor</h2>
          <p>Your Address: {this.state.acc}</p>
          <p>Owner Is : {this.props.state.owner}</p>
        </div>
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