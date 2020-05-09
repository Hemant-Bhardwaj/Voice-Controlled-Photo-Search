import React, {useCallback} from 'react';
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

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  toolbar: {
    backgroundColor: 'black'
  },
  icons: {
    color: 'gray',
    '&:hover': {
      color: 'white',
    }
  },
  search: {
    position: 'relative',
    borderRadius: 25,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '200px',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: 20,//`calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '60ch',
    },
  },
}));

export default function App() {
  const classes = useStyles();
  const [query, setQuery] = React.useState()
  const [listening, setListening] = React.useState(false);
  const [uploadedFile, setUploadedFile] = React.useState();
  const [uploadedFileS3Url, SetUploadedFileS3Url] = React.useState('');

  const AWS_API_GATEWAY_POST = 'afeqfeq'
  const S3_UPLOAD_PRESET = 'efnjkewfb'

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

  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles)
  }, [])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  const handleImageUpload = (file) => {
    let upload = request.post(AWS_API_GATEWAY_POST)
                     .field('upload_preset', S3_UPLOAD_PRESET)
                     .field('file', file);

    upload.end((err, response) => {
      if (err) {
        console.error(err);
      }

      if (response.body.secure_url !== '') {
        SetUploadedFileS3Url(response.body.secure_url)
      }
    });
  }

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
      {/* <Dropzone
  onDrop={imageDrop}
  accept="image/*"
  multiple={false}>
    {({getRootProps, getInputProps}) => {
      return (
        <div
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {
          <p>Try dropping some files here, or click to select files to upload.</p>
          }
        </div>
      )
  }}
</Dropzone> */}
<div className="dropBox" {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drop some files here, or click to select files</p>
      }
    </div>

    </div>
  );
}
