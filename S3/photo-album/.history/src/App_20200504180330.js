import React, { useEffect } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton'
import MicIcon from '@material-ui/icons/Mic';
import Upload from "./Upload";
import useStyles from './App-Style.js';
import axios from "axios";

var apigClientFactory = require('./apigClient').default;

export default function App() {
  const classes = useStyles();
  const [query, setQuery] = React.useState()
  const [listening, setListening] = React.useState(false);
  const [apigClient, setApigClient] = React.useState('');

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
    // axios({
    //   method: 'get',
    //   url: 'https://gf1tccyqza.execute-api.us-east-1.amazonaws.com/Dev/search/q=${val}&api_key=dbc0a6d62448554c27b6167ef7dabb1b`'
    // })
    //   .then(function (response) {
    //     console.log(response)
    //   });
  }

  const imagesList = ["https://b2-photo-bucket.s3.amazonaws.com/luca-bravo-TaCk3NspYe0-unsplash.jpg",
  "https://b2-photo-bucket.s3.amazonaws.com/dog_1.jpg"
]

let images = imagesList.map(image => {
  return <img key={image} src={image} alt="" className="img-responsive" />
});


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
          <div className="col-xs-12 col-sm-6 col-md-6 col-lg-6">
                       { images }
                    </div>       
      </div>

    </div>
  );
}
