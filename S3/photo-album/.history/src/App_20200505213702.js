import React, { useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import Upload from "./upload/Upload";
import useStyles from './App-Style.js';
import './App.css';
import axios from 'axios';

var apigClientFactory = require('./apigClient').default;
var AWS = require('aws-sdk');

export default function App() {
  const classes = useStyles();
  const [query, setQuery] = React.useState();
  const [apigClient, setApigClient] = React.useState('');
  const [imagesList, setImagesList] = React.useState([]);

  const recordAudio = () =>
  new Promise(async resolve => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise(resolve => {
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks, {type: 'audio/mpeg-3'});
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          const play = () => audio.play();
          resolve({ audioBlob, audioUrl, play });
        });

        mediaRecorder.stop();
      });

    resolve({ start, stop });
  });

// const sleep = time => new Promise(resolve => setTimeout(resolve, time));

// (async () => {
//   const recorder = await recordAudio();
//   recorder.start();
//   // await sleep(3000);
//   // const audio = await recorder.stop();
//   // audio.play();
// })();
let recorder;
let audio;

  const handleVoiceSearch = (voiceQuery) => {
    console.log('handleVoiceSearch')
    AWS.config.apiVersions = {
      transcribeservice: '2017-10-26',
    };
    
    // var params = {
    //   LanguageCode: en-US,
    //   Media: { /* required */
    //     MediaFileUri: voiceQuery.audioUrl
    //   },
    //   TranscriptionJobName: 'STRING_VALUE', /* required */
    //   ContentRedaction: {
    //     RedactionOutput: redacted, /* required */
    //     RedactionType: PII /* required */
    //   }
    // };
    // transcribeservice.startTranscriptionJob(params, function(err, data) {
    //   if (err) console.log(err, err.stack); // an error occurred
    //   else     console.log(data);           // successful response
    // });
  }


  const startRecording = async () => {
    if (!recorder) {
      recorder = await recordAudio();
    }
    recorder.start();
  }

  const stopRecording = async () => {
    audio = await recorder.stop();
    console.log("Audio: ", audio);
    handleVoiceSearch(audio);
    audio.play();
    // aws-audio-analysis11
    
  //   axios.put(url,file,config).then(response=>{
  //     // console.log(response.data)
  //     alert("Upload successful!!");
  //     this.setState({ successfullUploaded: true, uploading: false });
  // })
  }

  useEffect(() => {

    var apigClient = apigClientFactory.newClient({
      apiKey: 'hQxkihMJDJ1nF1Wjzysxs9VbL0stCjE4fFRLkorc'
    });

    setApigClient(apigClient)


  }, []);

  const handleTextSearch = (event) => { 

    axios({
      method: 'get',
      url: 'https://gf1tccyqza.execute-api.us-east-1.amazonaws.com/Dev/search?q='+query
    })
      .then(function(response) {
      setImagesList(response.data)
    })
    .catch((result) => {
        console.error(result);
      });

    if (imagesList.length === 0) {
      alert("No results!")
    }
  }

console.log(imagesList)
let images = imagesList.map(image => {
  return <img key={image} src={image} alt="" className="images" />
});

  return (
    <div className="App">
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <Typography className={classes.title} variant="h6" noWrap>
            Photo Album
          </Typography>
          <div className={classes.search}>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ 'aria-label': 'search' }}
              onChange={event=>{                               
              setQuery(event.target.value)            
        }}
            />
          <Tooltip title = "Search">
            <IconButton className={classes.icons} aria-label="search" onClick={handleTextSearch}>
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title = "Voice Search">
            <IconButton className={classes.icons} aria-label="search" onClick={startRecording}>
              <MicIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title = "Stop recording">
            <IconButton className={classes.icons} aria-label="search" onClick={stopRecording}>
              <MicOffIcon />
            </IconButton>
          </Tooltip>
          </div>
          <div className={classes.grow} />
        </Toolbar>
      </AppBar>
      <div className="Card">
        <Upload />
        <div className="imagesDiv"> { images } </div>      
      </div>
    </div>
    </div>
  );
}
