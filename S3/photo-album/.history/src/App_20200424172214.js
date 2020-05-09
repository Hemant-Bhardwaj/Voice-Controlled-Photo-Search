import React, {useCallback, useState, useEffect } from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton'
import MicIcon from '@material-ui/icons/Mic';
import {useDropzone} from 'react-dropzone'
import request from 'superagent';
import Dropzone from "./Dropzone";
import Upload from "./Upload";
import useStyles from './App-Style.js'
import DisplayImage from './DisplayImage';

var apigClientFactory = require('./apigClient').default;

export default function App() {
  const classes = useStyles();
  const [query, setQuery] = React.useState()
  const [listening, setListening] = React.useState(false);
  const [apigClient, setApigClient] = React.useState('');

  const handleTextSearch = (event) => { 
    console.log(query)
  }

  const handleSpeechSearch = (event) => {
    console.log(listening ? query : "Microphone is not on")
  }

  const toggleListen = () => {
    console.log(listening)
    setListening(true)
    console.log(listening)
    handleSpeechSearch()
  }

  useEffect(() => {

    var apigClient = apigClientFactory.newClient({
      apiKey: 'hQxkihMJDJ1nF1Wjzysxs9VbL0stCjE4fFRLkorc'
    });

    setApigClient(apigClient)
    console.log(apigClient)

  }, []);

  return (
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
            <IconButton className={classes.icons} aria-label="search" onClick={handleTextSearch}>
              <SearchIcon />
      </IconButton>
      <IconButton className={classes.icons} aria-label="search" onClick={toggleListen}>
        <MicIcon />
      </IconButton>
          </div>
          <div className={classes.grow} />
        </Toolbar>
        
      </AppBar>
      
      <div className="Card">
          <Upload />
          <DisplayImage/>
        </div>

    </div>
  );
}
