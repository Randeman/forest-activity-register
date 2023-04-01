import { Routes, Route } from 'react-router-dom';
import React from "react";

import Activities from "./components/Activities/Activities";
import CreateActivity from "./components/CreateActivity/CreateActivity";
import Navigation from "./components/Navigation/Navigation";
import MapProvider from './components/Map/Map';
import { Home } from './components/Home/Home';

//import "./App.css";

const App = () => {

  return (
    <>
      <header className="App-header">
        <Navigation />
      </header>
      <MapProvider >
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/activities' element={<Activities />} />
          <Route path='/create' element={<CreateActivity />} />
        </Routes>
      </MapProvider>
    </>

  );
};

export default App;
