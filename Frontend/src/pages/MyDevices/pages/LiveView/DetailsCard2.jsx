import React, { useEffect, useMemo, useState } from 'react';

import axios from "axios";


import { motion } from 'framer-motion';
import SensorCard from './SensorCard';
import { assets, liveDataSensors } from '../../../../assets/assets';
import MyChart from '../../../../components/MyChart';
import SensorCard2 from './SensorCard2';
import { Navigate, useNavigate, useParams } from 'react-router-dom';


const DetailsCard2 = () => {
  const { sensorId } = useParams()
  const [apiData, setApiData] = useState([]);
  const [online, setOnline] = useState()
  const [lastMeasure, setLastMeasure] = useState()
  const [serverConnectOk, setServerConnectOk] = useState()
  const navigate = useNavigate()

  const dataProbingMinutes = 2


  const dataFillNull = (data) => {

    const intervalMs = dataProbingMinutes * 60 * 1000
    const halfIntervalMs = intervalMs / 2
    const nowTimestamp = Date.now()


    let startTimestamp = (nowTimestamp - 24 * 60 * 60 * 1000)
    let calculatedData = [];
    let foundData = [];

    startTimestamp = startTimestamp - (startTimestamp % intervalMs)
    data = data.map(d => ({ ...d, timestamp: d.timestamp * 1000 }));


    for (let i = startTimestamp; i < nowTimestamp; i += intervalMs) {
      foundData = data.filter(d => (d.timestamp >= (i - intervalMs) && d.timestamp <= (i + intervalMs)))

      if (foundData.length > 0) {
        if (foundData.every(d => d.value === null)) {
          data.push({ value: null, timestamp: i })
        }
      }
      else {
        data.push({ value: null, timestamp: i })
      }
    }


    data.sort((a, b) => a.timestamp - b.timestamp);
    return (data)
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


    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://192.168.18.11:8000/api/devices/get-data-24h/${sensorId}`)
        setApiData(dataFillNull(res.data))
        setServerConnectOk(true)
      }
      catch (error) {
        console.error(error)
        setApiData([])
        setServerConnectOk(false)
      }
    };

    // pierwsze pobranie od razu
    fetchData();

    // ustaw polling co 5 sekund
    const funcInterval = setInterval(fetchData, 5000);//(dataProbingMinutes - 0.1) * 60 * 1000

    // cleanup
    return () => clearInterval(funcInterval);
  }, []);


  return (
    <motion.div
      className=' bg-gray-800 rounded-xl py-5 sm:px-10 absolute top-0 left-0 right-0 h-shv lg:h-full z-55'
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      animate={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <img
        src={assets.xmark}
        alt=""
        className='absolute top-5 right-5 w-10 h-10 md:w-15 md:h-15 cursor-pointer'
        onClick={() => navigate("../my-devices/live-view")}
      />
      <h2 className='text-center text-gray-300 mt-10 sm:mt-0 text-3xl md:text-4xl mb-10'>
        {"sensor.name"}
      </h2>

      <div className='flex flex-wrap xl:flex-nowrap px-5 items-center justify-center gap-5 pb-10'>
        <MyChart data={apiData} title={"Dane z ostaniej doby"} serverConnectOk={serverConnectOk} />

        <SensorCard2
          sensorData={{
            id: sensorId,
            name: "sensor.name",
            value: lastMeasure,
            online: online,

          }}
          hoverEffect={false}
          selected={false}
        />
      </div>
    </motion.div>
  );
};

export default DetailsCard2;
