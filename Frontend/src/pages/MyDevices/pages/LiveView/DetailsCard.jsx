import React, { useEffect, useMemo, useState } from 'react';

import axios from "axios";


import { motion } from 'framer-motion';
import SensorCard from './SensorCard';
import { assets, liveDataSensors } from '../../../../assets/assets';
import MyChart from '../../../../components/MyChart';
import { Navigate, useNavigate, useParams } from 'react-router-dom';


const DetailsCard = () => {
  const { sensorId } = useParams()
  const [apiData, setApiData] = useState({ data: [] });
  const [online, setOnline] = useState()
  const [lastMeasure, setLastMeasure] = useState()
  const [serverConnectOk, setServerConnectOk] = useState()
  const navigate = useNavigate()

  const dataProbingMinutes = 2

  function gaussianSmooth(data, radius = 5) {
    const sigma = radius / 2;
    const kernel = [];
    let sum = 0;

    for (let i = -radius; i <= radius; i++) {
      const val = Math.exp(-(i * i) / (2 * sigma * sigma));
      kernel.push(val);
      sum += val;
    }
    // normalizacja
    for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;

    const result = data.map((p, idx) => {
      if (p.value == null) return { ...p, value: null };

      let acc = 0, weight = 0;
      for (let k = -radius; k <= radius; k++) {
        const j = idx + k;
        if (j < 0 || j >= data.length) continue;
        if (data[j].value == null) continue;

        acc += data[j].value * kernel[k + radius];
        weight += kernel[k + radius];
      }
      return { timestamp: p.timestamp, value: acc / weight };
    });

    return result;
  }

  const dataChartPrepare = (data) => {

    const intervalMs = dataProbingMinutes * 60 * 1000
    const halfIntervalMs = intervalMs / 2
    const nowTimestamp = Date.now()



    let startTimestamp = (nowTimestamp - 24 * 60 * 60 * 1000)
    let calculatedData = [];
    let foundData = [];

    startTimestamp = startTimestamp - (startTimestamp % intervalMs)
    data = data.map(d => ({ ...d, timestamp: d.timestamp * 1000 }));

    // wypelnienie danych nullami
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

    console.log(data)
    return (gaussianSmooth(data, 10))
    // return (data)
  }


  const updateCard = () => {
    let value

    if (apiData.data.length > 0) {
      value = apiData.data[apiData.data.length - 1].value

    }

    if (value) {
      setOnline(true)
      setLastMeasure(value.toFixed(2));
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
        const res = await axios.get(`http://127.0.0.1:8000/api/devices/get-data-24h/${sensorId}`)
        const clearedData = dataChartPrepare(res.data.data)
        setApiData({
          ...res.data,
          data: clearedData
        })
        setServerConnectOk(true)
      }
      catch (error) {
        console.error(error)
        setApiData([])
        setServerConnectOk(false)
      }
    };


    fetchData();

    // ustaw polling co 5 sekund
    const funcInterval = setInterval(fetchData, 5000);//(dataProbingMinutes - 0.1) * 60 * 1000


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
        {apiData.name}
      </h2>

      <div className='flex flex-wrap xl:flex-nowrap px-5 items-center justify-center gap-5 pb-10'>
        <MyChart data={apiData.data} title={"Dane z ostaniej doby"} serverConnectOk={serverConnectOk} />

        <SensorCard
          sensorData={{
            id: sensorId,
            name: apiData.name,
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

export default DetailsCard;
