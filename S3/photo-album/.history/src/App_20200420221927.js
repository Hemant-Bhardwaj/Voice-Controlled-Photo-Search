import React from 'react';
import logo from './logo.svg';
import './App.css';
import SearchBar from 'material-ui-search-bar'

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <SearchBar
      onChange={() => console.log('onChange')}
      onRequestSearch={() => console.log('onRequestSearch')}
      style={{
        margin: '0 auto',
        maxWidth: 800
      }}
    />
      </header>
    </div>
  );
}

export default App;
