
import React, { useContext, useEffect, useState, useRef } from 'react';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { motion } from 'framer-motion';
import { Navigate, useNavigate } from 'react-router-dom';
import SensorCard from './SensorCard';
import axios from 'axios';
import { div, h2 } from 'framer-motion/client';
import { AuthContext } from '../UserHandler/AuthContext';
import api from '../../../../components/api.js'
import { assets } from '../../../../assets/assets.js';
import useAuth from '../UserHandler/useAuth.jsx'

const LiveView = () => {
  const [groupMode, setGroupMode] = useState(false)
  const [selectedSensors, setSelectedSensors] = useState([])
  const [groupName, setGroupName] = useState("")
  const [allSensors, setAllSensors] = useState([])
  const [serverConnectOk, setServerConnectOk] = useState(false)
  const navigate = useNavigate()
  const { loggedIn, username, setLoggedIn, setUsername } = useContext(AuthContext);
  const fullScreenRef = useRef()

  useAuth();

  useEffect(() => {


    const fetchData = async () => {
      try {
        const res = await api.get(`/sensors`)
        console.log(res.data)
        setAllSensors(res.data)
        setServerConnectOk(true)
      }
      catch (error) {
        console.error(error)
        setAllSensors([])
        setServerConnectOk(false)
        if (error.response?.status === 401) {
          navigate("/login")
        }
      }
    }

    fetchData()

    const justLoggedIn = sessionStorage.getItem("justLoggedIn")
    if (justLoggedIn) {
      toast.success("Zalogowano pomyślnie")
      sessionStorage.removeItem("justLoggedIn")
    }

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval)
  }, [])

  const groupToggleSensor = (id) => {
    setSelectedSensors(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const cancelGroup = () => {
    setSelectedSensors([]);
    setGroupMode(false);
    setGroupName("");
  };

  const toggleFullscreen = () => {

    if (!document.fullscreenElement) {
      fullScreenRef.current.requestFullscreen()
    }
    else {
      document.exitFullscreen()
    }
  }

  const confirmGroup = async () => {
    const data = selectedSensors.map(s => ({ id: s, group_name: groupName }))
    try {
      await api.patch("/sensors/group", data)
    }
    catch {
      console.error(err)
    }
    setAllSensors(prev =>
      prev.map(sensor =>
        selectedSensors.includes(sensor.id)
          ? { ...sensor, group_name: groupName }
          : sensor
      )
    );
    cancelGroup();
  };

  const handleCardClick = (sensorId, measurementsGroupId) => (
    groupMode ? groupToggleSensor(sensorId) : measurementsGroupId && navigate(`../../../details-card/${measurementsGroupId}`)
  )

  const groups = [
    ...new Set(allSensors.filter(d => d.group_name !== "Inne").map(d => d.group_name)),
    ...(allSensors.some(d => d.group_name === "Inne") ? ["Inne"] : [])
  ];

  const groupBar = (
    <div className='flex items-center justify-center pt-5 sm:justify-end sm:pr-20 relative'>
      <img src={assets.expand} alt="" className='w-10 absolute top-5 right-5 cursor-pointer transition-all opacity-70 duration-200 hover:scale-110 hover:opacity-100'
        onClick={toggleFullscreen} />
      {!groupMode && (
        <button
          className='button'
          onClick={() => setGroupMode(true)}
          type='button'
        >
          Grupuj
        </button>
      )}
      {groupMode &&
        <form onSubmit={(e) => {
          e.preventDefault()
          if (selectedSensors.length > 0 && groupName !== "") {
            confirmGroup()
          }
        }}
          className='flex flex-col items-center gap-2 sm:block'>
          <p className='text-left text-gray-300 text-xl mb-1'>Wybierz karty</p>
          <input type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className='block bg-gray-400 text-gray-700 mb-3 rounded-sm w-full h-10 px-2'
            placeholder='Podaj nazwę grupy' />
          <button
            className={`w-15 mx-2 text-xl text-gray-300 py-2 rounded-xl  font-bold
                          ${selectedSensors.length === 0 || groupName === "" ? "pointer-events-none bg-gray-500" : "cursor-pointer bg-cyan-700 hover:bg-cyan-600"}`}
            type='submit'
          >
            Ok
          </button>
          <button
            className='w-25 mx-2 text-xl text-gray-300 bg-cyan-700 py-2 rounded-xl hover:bg-cyan-600 font-bold cursor-pointer'
            onClick={cancelGroup}
            type='button'
          >
            Anuluj
          </button>
        </form>
      }
    </div>
  )

  return (
    <div className='w-full h-auto'>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        theme="dark"
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        transition={Bounce}
      />
      <motion.div
        className='flex flex-col justify-center px-1 sm:px-20 mt-10'
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        animate={{ opacity: 1 }}
        viewport={{ once: true }}
      > {!serverConnectOk ?
        <div className='bg-gray-800 rounded-2xl'>
          <h2 className='text-gray-300 text-center text-3xl py-10'>Brak połączenia z serwerem</h2>
        </div>
        :
        <div className='flex flex-col bg-gray-800 rounded-xl my-10 sm:px-10'
          ref={fullScreenRef}>
          {groupBar}
          {!groups.length > 0 && <h2 className='text-gray-400 text-4xl pb-5'>Brak skonfigurowanych czujników</h2>}
          {groups.map((group, index) => (
            <div key={index}>
              <h2 className='text-gray-300 text-3xl font-bold my-10 w-full text-center bg-gray-700 rounded-md'>{group}</h2>
              <div className='flex flex-wrap pb-10 px-10 gap-10 justify-center'>
                {allSensors.filter(d => d.group_name === group && d.measurements_group).map((d) => (
                  <SensorCard
                    key={d.id}
                    sensorData={{
                      id: d.id,
                      measurements_group_name: d.measurements_group.name,
                      measurements_group_id: d.measurements_group ? d.measurements_group.id : null,
                      online: d.actual_value != null,
                      value: d.actual_value,
                      battery_percent: d.battery_percent
                    }}
                    hoverEffect={true}
                    selected={selectedSensors.includes(d.id)}
                    onSelect={handleCardClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>}
      </motion.div>
    </div>
  );
};

export default LiveView;
