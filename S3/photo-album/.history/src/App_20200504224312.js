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
import Upload from "./Upload";
import useStyles from './App-Style.js';
import axios from "axios";
import './App.css';

var apigClientFactory = require('./apigClient').default;

export default function App(config: RecorderConfigInterface) {
  const classes = useStyles();
  const [query, setQuery] = React.useState();
  const [apigClient, setApigClient] = React.useState('');
  const {
    canvas,
    handleStartRecording,
    handleRecording,
    setFiles,
    handleFinishRecording,
  } = config;
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [
    audioInput,
    setAudioInput,
  ] = useState<MediaStreamAudioSourceNode | null>(null);
  const [audioNode, setAudioNode] = useState<ScriptProcessorNode | null>(null);
  const [bufferSize /* setBufferSize */] = useState(4096);
  const [, /* blob */ setBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [microphone, setMicrophone] = useState<MediaStream | null>(null);
  const [recordedData, setRecordedData] = useState<Float32Array[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordingLength, setRecordingLength] = useState(0);
  const [sampleRate, setSampleRate] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);

  const toggleRecording = () => {
    recording ? stop() : start();
  };
  const processInWebWorker = (_function: any) => {
    const workerURL = URL.createObjectURL(
      new Blob(
        [
          _function.toString(),
          `;this.onmessage = function(e) {${_function.name}(e.data);}`,
        ],
        {
          type: 'application/javascript',
        }
      )
    );

    const worker = new Worker(workerURL);
    worker.workerURL = workerURL;
    return worker;
  };
  function exportWav(config: any, callback: any) {
    function inlineWebWorker(config: any, cb: any) {
      function joinBuffers(channelBuffer: any, count: any) {
        const result = new Float64Array(count);
        let offset = 0;
        const lng = channelBuffer.length;

        for (let i = 0; i < lng; i++) {
          const buffer = channelBuffer[i];
          result.set(buffer, offset);
          offset += buffer.length;
        }

        return result;
      }
      function writeUTFBytes(view: any, offset: any, string: string) {
        const lng = string.length;
        for (let i = 0; i < lng; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      }
      const firstData = config.data.slice(0);
      const data = joinBuffers(firstData, config.recordingLength);

      const dataLength = data.length;

      // create wav file
      const buffer = new ArrayBuffer(44 + dataLength * 2);
      const view = new DataView(buffer);

      writeUTFBytes(view, 0, 'RIFF'); // RIFF chunk descriptor/identifier
      view.setUint32(4, 44 + dataLength * 2, true); // RIFF chunk length
      writeUTFBytes(view, 8, 'WAVE'); // RIFF type
      writeUTFBytes(view, 12, 'fmt '); // format chunk identifier, FMT sub-chunk
      view.setUint32(16, 16, true); // format chunk length
      view.setUint16(20, 1, true); // sample format (raw)
      view.setUint16(22, 1, true); // mono (1 channel)
      view.setUint32(24, config.sampleRate, true); // sample rate
      view.setUint32(28, config.sampleRate * 2, true); // byte rate (sample rate * block align)
      view.setUint16(32, 2, true); // block align (channel count * bytes per sample)
      view.setUint16(34, 16, true); // bits per sample
      writeUTFBytes(view, 36, 'data'); // data sub-chunk identifier
      view.setUint32(40, dataLength * 2, true); // data chunk length

      // write the PCM samples
      let index = 44;
      for (let i = 0; i < dataLength; i++) {
        view.setInt16(index, data[i] * 0x7fff, true);
        index += 2;
      }

      if (cb) {
        return cb({
          buffer: buffer,
          view: view,
        });
      }
      self.postMessage({
        buffer: buffer,
        view: view,
      });
    }
    const webWorker = processInWebWorker(inlineWebWorker);

    webWorker.onmessage = function messageFn(event) {
      callback(event.data.buffer, event.data.view);

      // release memory
      URL.revokeObjectURL(webWorker.workerURL);
    };

    webWorker.postMessage(config);
  }
  const stopRecording = (callback: (blob: Blob) => void) => {
    setRecording(false);

    if (!audioInput || !audioNode || !audioCtx || !microphone) return;
    microphone.getTracks().forEach(t => t.stop());
    audioInput.disconnect();
    audioNode.disconnect();
    audioCtx.close();
    setMicrophone(null);
    setAudioInput(null);
    setAudioCtx(null);
    setAudioNode(null);
    setStartDate(null);
    setSampleRate(null);
    exportWav(
      {
        sampleRate,
        recordingLength,
        data: recordedData,
      },
      function totallyNecessaryName(buffer: Buffer, view: DataView) {
        console.log(buffer);
        const newBlob = new Blob([view], { type: 'audio/wav' });
        setBlob(newBlob);
        callback && callback(newBlob);
      }
    );
  };
  const onAudioProcess = (e: AudioProcessingEvent) => {
    if (!recording) {
      return;
    }
    const float = new Float32Array(e.inputBuffer.getChannelData(0));
    const newDuration =
      new Date().getTime() - ((startDate && startDate.getTime()) || 0);
    setRecordedData(prev => [...prev, float]);
    setRecordingLength(prev => prev + bufferSize);
    setDuration(newDuration);
    handleRecording && handleRecording(newDuration);
  };
  const onMicrophoneError = (e: Error) => {
    console.log(e);
  };
  const onMicrophoneCaptured = (microphone: MediaStream) => {
    setRecording(true);
    if (audioCtx) {
      const newAudioInput = audioCtx.createMediaStreamSource(microphone);
      const newDate = new Date();
      const audioCtxSampleRate = audioCtx.sampleRate;
      setMicrophone(microphone);
      setAudioInput(newAudioInput);
      setStartDate(newDate);
      setSampleRate(audioCtxSampleRate);
    }
  };

  useEffect(() => {
    if (!canvas || !audioCtx || !audioInput) return;
    visualization(canvas, audioCtx, audioInput, config.visualizer, false);
  });
  useEffect(() => {
    if (duration > 30000) {
      stop();
    }
  }, [duration]);

  useEffect(() => {
    if (audioInput && audioNode && audioCtx && startDate) {
      audioInput.connect(audioNode);
      audioNode.addEventListener('audioprocess', onAudioProcess);
    }
    return () => {
      audioNode &&
        audioNode.removeEventListener('audioprocess', onAudioProcess);
    };
  }, [audioInput, startDate]);
  useEffect(() => {
    if (audioNode && (audioCtx && audioCtx.state !== 'closed')) {
      audioNode.connect(audioCtx.destination);
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(onMicrophoneCaptured)
        .catch(onMicrophoneError);
    }
    return () => {
      if (audioNode && audioCtx && audioCtx.state === 'closed') {
        audioNode.disconnect();
        setAudioNode(null);
      }
    };
  }, [audioNode]);
  useEffect(() => {
    if (audioCtx && audioCtx.createScriptProcessor) {
      const newNode: ScriptProcessorNode = audioCtx.createScriptProcessor(
        bufferSize,
        1,
        1
      ) as ScriptProcessorNode;
      setAudioNode(newNode);
    } else if (!audioCtx) {
      console.log('awaiting context');
    } else {
      const error = { message: 'WebAudio not supported!' };
      console.log(error);
    }

    return () => {
      if (audioCtx && audioCtx.state !== 'closed') {
        try {
          audioCtx.close();
          setAudioCtx(null);
        } catch (error) {
          console.log(error);
        }
      }
    };
  }, [audioCtx]);

  const start = () => {
    const AudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    setAudioCtx(AudioContext);
    setRecordedData([]);
    setRecordingLength(0);
    handleStartRecording && handleStartRecording();
  };
  const stop = () => {
    stopRecording(newBlob => {
      setBlob(newBlob);
      const fileId = Date.now();
      const newFile = new File([newBlob], `file-${fileId}.mp3`, {
        type: 'audio/mp3',
      });
      const newFileWithId = { id: fileId, file: newFile };
      setFiles(prevState => [newFileWithId, ...prevState]);
      handleFinishRecording && handleFinishRecording(newBlob);
      setDuration(0);
    });
  };
  console.log(duration, toggleRecording, recording);
  return { duration, toggleRecording, recording };
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
