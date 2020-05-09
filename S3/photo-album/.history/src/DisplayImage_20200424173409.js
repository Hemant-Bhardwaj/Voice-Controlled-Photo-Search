import React, { Component } from 'react';
import axios from 'axios';

export default class DisplayImage extends Component {
  state = { message: '' };

  formHandler = e => {
    e.preventDefault();
    this.setState({ message: 'Loading...' });
    const filename = document.querySelector('#filename').value;
    const generateGetUrl = 'https://s3.console.aws.amazon.com/s3/buckets/b2-photo-bucket/?region=us-east-1';
    const options = {
      params: {
        Key: filename,
        ContentType: 'image/jpeg'
      }
    };
    axios.get(generateGetUrl, options).then(res => {
      const { data: getURL } = res;
      this.setState({ getURL });
    });
  };

  handleImageLoaded = () => {
    this.setState({ message: 'Done' });
  };

  handleImageError = () => {
    this.setState({ message: 'Sorry, something went wrong. Please check if the remote file exists.' });
  };

  render() {
    const { getURL, message } = this.state;
    return (
      <React.Fragment>
        <form onSubmit={this.formHandler}>
          <label> Image name:</label>
          <input id='filename' />

          <button>Load</button>
        </form>
        <p>{message}</p>
        <div className='preview-container'>
          {getURL && (
            <React.Fragment>
              <div className='preview'>
                <img
                  id='show-picture'
                  src={getURL}
                  alt='File stored in AWS S3'
                  onLoad={this.handleImageLoaded}
                  onError={this.handleImageError}
                />
              </div>
            </React.Fragment>
          )}
        </div>
      </React.Fragment>
    );
  }
}