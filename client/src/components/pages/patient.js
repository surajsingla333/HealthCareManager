import React, { Component } from "react";
import { Form, Button } from 'react-bootstrap';

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
            return inst.methods.allPrescriptions().call({from: this.state.acc.toString()});
        }.bind(this)).then(function(presc){
            this.setState({prescriptions: presc});
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

    sendFile(e){
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
            return inst.methods.docFee(doctor.toString()).call({from: this.state.acc.toString()});
        }.bind(this)).then(function(fee){
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

        var fileList = files.length == 0 ? function () { console.log(files.length); return <div>"No Data"</div> } : files.map(function (file, index) {
            console.log(files.length);
            return <li key={index}>{file}</li>
        });

        var prescription = this.state.prescriptions;

        console.log(prescription);

        var prescriptionList = prescription.length == 0 ? function () { console.log(prescription.length); return (<div>"No Data"</div>) } : prescription.map(function (file, index) {
            console.log(prescription.length);
            console.log("PRESCRIPTIONS", file)
            return <li key={index}>File: {file[0]}              Prescription: {file[1]}</li>
        });

        var balance = this.state.balance;


        if (this.state.acc === null) {
            return (
                <div style={{marginLeft:"10px", paddingRight:"50px"}}>Loading...</div>
            )
        }
        else if (this.state.isPatient === true) {

            return (

                <div style={{marginLeft:"10px", paddingRight:"50px"}}>
                    <h2>Token Balance</h2>
                    <div>
                        {balance}
                    </div>
                    <h2>ADD Data file in Excel</h2>
                    <Form onSubmit={this.addFile.bind(this)}>
                        <a className="button browse blue">Browse</a>
                        <input
                            type='file' label='Upload' accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/pdf, application/docx" ref='fileUpload'
                        />

                        <Button variant="primary" type="submit">Submit</Button>

                    </Form>

                    <h2>List All Files</h2>
                    <div>
                        <ul>
                            {fileList}
                        </ul>
                    </div>

                    <h2>Send File to doctor</h2>

                    <Form onSubmit={this.sendFile.bind(this)}>

                        <Form.Group controlId="fileHash">
                            <Form.Label>File Hash from above</Form.Label>
                            <Form.Control type="text" placeholder="Enter Hospital name" ref='fileHash' />
                        </Form.Group>

                        <Form.Group controlId="addressDoc">
                            <Form.Label>Doctor's Address</Form.Label>
                            <Form.Control type="text" placeholder="Enter Doctor's Address" ref='docAdd' />
                        </Form.Group>

                        {/* <a className="button browse blue">Browse</a>


                        <input
                            type='file' label='Upload' accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            ref='fileUploadDoc'
                        /> */}

                        <Button variant="primary" type="submit">Submit</Button>

                    </Form>

                    <h2>Prescriptions Sent</h2>
                    <div>
                        <ul>
                            {prescriptionList}
                        </ul>
                    </div>

                </div>

            );
        }
        else {
            return (
                <div style={{marginLeft:"10px", paddingRight:"50px"}}>
                    <h2>You are not a patient</h2>
                    <p> Your Address: {this.state.acc}</p>
            <p> Owner Address: {this.props.state.owner}</p>
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