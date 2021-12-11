import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

var errDB;

function Output(param) {
  if (param.reportField === "") {
    return;
  }

  return (
    <div className="card outputBox container">
      <header className="text-dark outputText">Output:</header>
      <h2 className="text-light outputText">
        {param.isRendering ? "Loading ..." : param.outputRender}
      </h2>
      <footer className="infoText">
        <p>
          Module: {param.reportField !== "No Input" ? param.module : "Unknown"}
          <p />
          Description: {param.module_name}
        </p>
      </footer>
    </div>
  )
}

function getErrorDB() {
  const request = new XMLHttpRequest();
  request.open("GET", "https://raw.githubusercontent.com/tumGER/BETCH/actions/api.json", false)
  request.send(null);

  errDB = JSON.parse(request.responseText);
}

class Main extends React.Component {
  state = {
    inputField: "",
    reportField: "",
    module: 0,
    desc: 0,
    module_name: "",
    desc_name: "",
    outputRender: ({}),
    isRendering: false
  };

  searchError() {
    var input = this.state.inputField;
    var err;
    var desc_name;
    var module_name = "Unknown";
    var reportField;
    var outputRender = ({});
    var module;
    var desc;

    this.setState({
      isRendering: true
    })

    if (this.state.inputField === "") {
      reportField = "No Input";
      outputRender = (
        <div>
          <p>No input was provided.</p>
        </div>
      )
    } else if (input.startsWith("0x")) {
      err = Number(input.substring(2)) & 0x1FF;
      module = err & 0x1FF;
      desc = (err << 9) & 0x3FFF;
    } else if (input.startsWith("2")) {
      module = Number(input.substring(1, 4));
      desc = Number(input.substring(5))
    } else {
      outputRender = (
        <div>
          <p>It seems like the error code is unknown!</p>
          <p>If you know the reason for the error code please either update https://switchbrew.org/wiki/Error_codes
            or send a PR to https://github.com/tumGER/BETCH.</p>
        </div>
      );
      reportField = "Unknown";
    }

    if (module in errDB) {
      if ("name" in errDB[module]) {
        module_name = errDB[module]["name"]
      }
      if (desc in errDB[module]) {
        desc_name = errDB[module][desc]
        reportField = "Found"
        outputRender = (
          <div>
            <p>{desc_name}</p>
          </div>
        )
      }
    }

    this.setState(
      {
        desc_name: desc_name,
        module_name: module_name,
        desc: desc,
        module: module,
        outputRender: outputRender,
        reportField: reportField,
        isRendering: false
      }
    )
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            BETCH WebApp
            <h4 className="infoText text-dark">Type the error code here:</h4>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <p>
              <input
                value={this.state.inputField}
                onChange={e => this.setState({ inputField: e.target.value })}
              />
            </p>
            <p>
              <button
                className="button primary runButton"
                onClick={() => this.searchError()}
              >
                Search
              </button>
            </p>
            <p>
              {Output(this.state)}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

// ========================================

getErrorDB();
ReactDOM.render(
  (
    <Main />
  ),
  document.getElementById('root')
);
