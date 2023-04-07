import { Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

import { AuthProvider } from './contexts/AuthContext';
import { activityServiceFactory } from './services/activityService';
//import { figureServiceFactory } from './services/figureService';

import Navigation from "./components/Navigation/Navigation";
import MapProvider from './components/Map/Map';
import { Home } from './components/Home/Home';
import { Login } from "./components/Login/Login";
import { Logout } from "./components/Logout/Logout";
import { Register } from "./components/Register/Register";
import {Activities} from "./components/Activities/Activities";
import {CreateActivity} from "./components/CreateActivity/CreateActivity";
import { EditActivity } from './components/EditActivity/EditActivity';
import { ActivityDetails } from './components/ActivityDetails/ActivityDetails';
import { Footer } from "./components/Footer/Footer";
import "./App.css";

const App = () => {

  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const activityService = activityServiceFactory(); //auth.accessToken
  
  useEffect(() => {
    activityService.getAll()
      .then(result => {
        setActivities(result)
      })
  }, []);


  const onCreateActivitySubmit = async (data) => {
    const newActivity = await activityService.create(data);

    setActivities(state => [...state, newActivity]);

    navigate('/activities');
  };

  const onEditActivitySubmit = async (values) => {
    const result = await activityService.edit(values._id, values);

    setActivities(state => state.map(x => x._id === values._id ? result : x))

    navigate(`/activities/${values._id}`);
  }

  const onDeleteActivitySubmit = async function (activityId) {
    await activityService.delete(activityId);

    setActivities(state => state.filter(x => x._id !== activityId)).map(x => x);

    navigate("/activities");
  }


  return (
    <>
      <AuthProvider>
        <header className="app-header">
          <Navigation />
        </header>
        <main className="app-main">
        <MapProvider >
          <Routes>
            <Route path='/' element={<Home activities={activities} />} />
            <Route path='/login' element={<Login />} />
            <Route path='/logout' element={<Logout />} />
            <Route path='/register' element={<Register />} />
            <Route path='/activities' element={<Activities activities={activities} />} />
            <Route path='/create' element={<CreateActivity onCreateActivitySubmit={onCreateActivitySubmit} />} />
            <Route path='/activities/:activityId' element={<ActivityDetails  onDeleteActivitySubmit={onDeleteActivitySubmit}/>} />
            <Route path='/activities/:activityId/edit' element={<EditActivity onEditActivitySubmit={onEditActivitySubmit} />} />
          </Routes>
        </MapProvider>
        </main>
         <Footer />      
      </AuthProvider >
    </>
  );
};

export default App;
