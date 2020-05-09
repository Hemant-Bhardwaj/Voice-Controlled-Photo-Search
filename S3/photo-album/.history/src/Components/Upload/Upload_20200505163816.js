import React, { Component } from "react";
import Dropzone from "../Dropzone/Dropzone.js";
import "./Upload.css";
import Progress from "src/Components/Progress/Progress.js";
import axios from 'axios';
var apigClientFactory = require('src/apigClient').default;

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploading: false,
      uploadProgress: {},
      successfullUploaded: false,
      apigClient: null
    };

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.renderActions = this.renderActions.bind(this);
  }

  onFilesAdded(files) {
    this.setState(prevState => ({
      files: prevState.files.concat(files)
    }));
  }

  componentDidMount() {
    var apigClient = apigClientFactory.newClient({
      apiKey: 'VG5vT5FSru1Wr2nkfnAsI6qbvya6x48acmdA7jdb'
    });

    this.setState({
      apigClient : apigClient
    });
  }

  async uploadFiles() {
    this.setState({ uploadProgress: {}, uploading: true });
    const promises = [];
    this.state.files.forEach(file => {
      promises.push(this.sendRequest(file));
    });

    try {
      await Promise.all(promises);

      this.setState({ successfullUploaded: true, uploading: false });
    } catch (e) {
      // Not Production ready! Do some error handling here instead...
      this.setState({ successfullUploaded: true, uploading: false });
    }
  }

  sendRequest(file) {
    return new Promise((resolve, reject) => {
      // const req = new XMLHttpRequest();

      // req.upload.addEventListener("progress", event => {
      //   if (event.lengthComputable) {
      //     const copy = { ...this.state.uploadProgress };
      //     copy[file.name] = {
      //       state: "pending",
      //       percentage: (event.loaded / event.total) * 100
      //     };
      //     this.setState({ uploadProgress: copy });
      //   }
      // });

      // req.upload.addEventListener("load", event => {
      //   const copy = { ...this.state.uploadProgress };
      //   copy[file.name] = { state: "done", percentage: 100 };
      //   this.setState({ uploadProgress: copy });
      //   resolve(req.response);
      // });

      // req.upload.addEventListener("error", event => {
      //   const copy = { ...this.state.uploadProgress };
      //   copy[file.name] = { state: "error", percentage: 0 };
      //   this.setState({ uploadProgress: copy });
      //   reject(req.response);
      // });

      // const formData = new FormData();
      // formData.append("file", file, file.name);

      var bucketName = 'b2-photo-bucket'

      const params = {
        "Content-Type": file.type,
        "bucket": bucketName,
        "key": file.name
      }

      const body = {
        "body": file
      }

      let config = {
        headers:{'Content-Type': file.type , "X-Api-Key":"VG5vT5FSru1Wr2nkfnAsI6qbvya6x48acmdA7jdb"},
        onUploadProgress: progressEvent => {
          let percentCompleted = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
          console.log("Completed: ", percentCompleted)
          const copy = { ...this.state.uploadProgress };
          copy[file.name] = {
            state: "pending",
            percentage: percentCompleted
          };
          this.setState({ uploadProgress: copy });
        },

        onProgressComplete: progressEvent => {
          const copy = { ...this.state.uploadProgress };
          copy[file.name] = { state: "done", percentage: 100 };
          this.setState({ uploadProgress: copy });
          resolve(axios.response);
        }

    };
  
    let url = 'https://gf1tccyqza.execute-api.us-east-1.amazonaws.com/Dev/upload/b2-photo-bucket/' + file.name

      console.log('params: ', params)
      console.log('Body: ', body)
      console.log('apigClient: ', this.state.apigClient)

      // this.state.apigClient.uploadBucketKeyPut(url, file, config)
      // .then((response) => {
      //   alert('File Uploaded')
      //   console.log(response)
      // })
      // .catch((result) => {
      //   console.error(result);
      // });

  axios.put(url,file,config).then(response=>{
      // console.log(response.data)
      alert("Upload successful!!");
      this.setState({ successfullUploaded: true, uploading: false });

  })

      });

      
  }

  renderProgress(file) {
    const uploadProgress = this.state.uploadProgress[file.name];
    if (this.state.uploading || this.state.successfullUploaded) {
      return (
        <div className="ProgressWrapper">
          <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
          <img
            className="CheckIcon"
            alt="done"
            src="baseline-check_circle_outline-24px.svg"
            style={{
              opacity:
                uploadProgress && uploadProgress.state === "done" ? 0.5 : 0
            }}
          />
        </div>
      );
    }
  }

  renderActions() {
    if (this.state.successfullUploaded) {
      return (
        <button
          onClick={() =>
            this.setState({ files: [], successfullUploaded: false })
          }
        >
          Clear
        </button>
      );
    } else {
      return (
        <button
          disabled={this.state.files.length < 0 || this.state.uploading}
          onClick={this.uploadFiles}
        >
          Upload
        </button>
      );
    }
  }

  render() {
    return (
      <div className="Upload">
        <div className="Content">
          <div>
            <Dropzone
              onFilesAdded={this.onFilesAdded}
              disabled={this.state.uploading || this.state.successfullUploaded}
            />
          </div>
          <div className="Files">
            {this.state.files.map(file => {
              return (
                <div key={file.name} className="Row">
                  <span className="Filename">{file.name}</span>
                  {this.renderProgress(file)}
                </div>
              );
            })}
          </div>
        </div>
        <div className="Actions">{this.renderActions()}</div>
      </div>
    );
  }
}

export default Upload;