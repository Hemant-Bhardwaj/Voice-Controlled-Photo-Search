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
import Upload from "..Components//upload/Upload";
import useStyles from './App-Style.js';
import axios from "axios";
import './App.css';
import { ReactMic } from 'react-mic';

var apigClientFactory = require('./apigClient').default;

export default function App() {
  const classes = useStyles();
  const [query, setQuery] = React.useState();
  const [apigClient, setApigClient] = React.useState('');

  const handleSpeechSearch = (event) => {
    console.log('listening' ? query : "Microphone is not on")
  }

  const toggleListen = () => {
    // handleSpeechSearch()
  }

  useEffect(() => {

    var apigClient = apigClientFactory.newClient({
      apiKey: 'hQxkihMJDJ1nF1Wjzysxs9VbL0stCjE4fFRLkorc'
    });

    setApigClient(apigClient)


  }, []);

  const handleTextSearch = (event) => { 
    console.log(query)
    const searchQuery = "dog";
    const params = {q: searchQuery};
    apigClient.searchGet(params, {}, {})
    .then((response) => {
      console.log(response)
    })
    .catch((result) => {
      console.error(result);
    });
  }

  const imagesList = ["https://b2-photo-bucket.s3.amazonaws.com/luca-bravo-TaCk3NspYe0-unsplash.jpg",
  "https://b2-photo-bucket.s3.amazonaws.com/dog_1.jpg"
]

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
      <IconButton className={classes.icons} aria-label="search" onClick={toggleListen}>
        <MicIcon />
      </IconButton>
      </Tooltip>
      <Tooltip title = "Stop recording">
      <IconButton className={classes.icons} aria-label="search" onClick={toggleListen}>
      <MicOffIcon />
      </IconButton>
      </Tooltip>
      
      
          </div>
          <div className={classes.grow} />
        </Toolbar>
        
      </AppBar>
      
      <div className="Card">
          <Upload />
          <div className="imagesDiv">
                       { images }
                    </div>       
      </div>

    </div>
    </div>
  );
}
