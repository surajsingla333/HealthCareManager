import React, { Component } from "react";
import "../../App.css";

import { connect } from 'react-redux';

class Home extends Component {

    componentDidMount() {
        console.log("PROPS IN HOME", this.props);
    }


    render() {
        return (
            <div style={{marginLeft:"10px", paddingRight:"50px"}}>
                <h1>
                    Welcome to Health Care.
                </h1>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        state
    }
}

export default connect(mapStateToProps)(Home);