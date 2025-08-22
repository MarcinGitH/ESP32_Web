import React, { useEffect, useMemo, useState } from 'react';

import axios from "axios";


import { motion } from 'framer-motion';
import SensorCard from './SensorCard';
import { assets, liveDataSensors } from '../../../../assets/assets';
import MyChart from '../../../../components/MyChart';


const DetailsCard = ({ sensor, setLiveDetailsId, selectedSensors, groupMode, groupToggleSensor }) => {
  const [apiData, setApiData] = useState([]);
  const [online, setOnline] = useState()
  const [lastMeasure, setLastMeasure] = useState()
  const [serverConnectOk,setServerConnectOk] = useState()


  const dataProbingMinutes = 5

  const dataFillNull = (data) => {
    
    const intervalMs = dataProbingMinutes * 60 * 1000
    const halfIntervalMs = intervalMs / 2
    const nowTimestamp = Date.now()
    
    let startTimestamp = (nowTimestamp - 24 * 60 * 60 * 1000)
    let calculatedData = [];
    let foundData;

    startTimestamp = startTimestamp - (startTimestamp % intervalMs)
    data = data.map(d => ({ ...d, timestamp: d.timestamp * 1000 }));


    for (let i = startTimestamp; i < nowTimestamp; i += intervalMs) {
      foundData = data.find(d => (d.timestamp >= (i - halfIntervalMs) && d.timestamp <= (i + halfIntervalMs)))
      calculatedData.push({
        timestamp: foundData ? foundData.timestamp : i,
        value: foundData ? foundData.value : null
      })
    }
    return (calculatedData)
  }

  const updateCard = () => {
    let value
    if (apiData.length > 0) {
      value = apiData[apiData.length - 1].value
      setLastMeasure(value);
    }

    if (value) {
      setOnline(true)
    }
    else {
      setOnline(false)
    }

  }

  useEffect(() => {
    updateCard()
  }, [apiData])

  useEffect(() => {
    const fetchData = async () => {
      try{
        const res = await axios.get(`http://127.0.0.1:8000/api/devices/get-data-24h/${sensor.id}`)
        setApiData(dataFillNull(res.data))
        setServerConnectOk(true)
      }
      catch(error){
        console.error(error)
        setApiData([])
        setServerConnectOk(false)
      }
    };

    // pierwsze pobranie od razu
    fetchData();

    // ustaw polling co 5 sekund
    const funcInterval = setInterval(fetchData, (dataProbingMinutes+0.1)*60*1000 );//dataProbingMinutes+0.1)*60*1000 

    // cleanup
    return () => clearInterval(funcInterval);
  }, []);


  return (
    <motion.div
      className='flex flex-col bg-gray-800 rounded-xl mt-10 py-5 sm:px-10 relative'
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      animate={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <img
        src={assets.xmark}
        alt=""
        className='absolute top-5 right-5 w-10 h-10 md:w-15 md:h-15 cursor-pointer'
        onClick={() => setLiveDetailsId(-1)}
      />
      <h2 className='text-center text-gray-300 mt-10 sm:mt-0 text-3xl md:text-4xl mb-10'>
        {sensor.name}
      </h2>

      <div className='flex flex-wrap xl:flex-nowrap px-5 items-center justify-center gap-5'>
        <MyChart data={apiData} title={"Dane z ostaniej doby"} serverConnectOk={serverConnectOk}/>
        <SensorCard
          data={{
            id: sensor.id,
            name: sensor.name,
            value: lastMeasure,
            online: online,

          }}
          selectedSensors={selectedSensors}
          groupMode={groupMode}
          groupToggleSensor={groupToggleSensor}
          liveDetailsId={sensor.id}
          setLiveDetailsId={setLiveDetailsId}
        />
      </div>
    </motion.div>
  );
};

export default DetailsCard;
