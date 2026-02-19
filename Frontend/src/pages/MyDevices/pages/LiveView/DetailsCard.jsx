import React, { useEffect, useMemo, useState } from 'react';

import axios from "axios";


import { motion } from 'framer-motion';
import SensorCard from './SensorCard';
import { assets } from '../../../../assets/assets';
import MyChart from '../../../../components/MyChart';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import api from '../../../../components/api.js'
import useAuth from '../UserHandler/useAuth.jsx'
const DetailsCard = () => {
  const { measurementsGroup } = useParams()
  const [apiData, setApiData] = useState({ data: [] });
  const [lastMeasure, setLastMeasure] = useState()
  const [serverConnectOk, setServerConnectOk] = useState()
  const navigate = useNavigate()


  useAuth();





  useEffect(() => {


    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchData = async () => {
      try {

        const res = await api.get(`/measure-groups/${measurementsGroup}/data-24h`)
        if (res.data.data) {

          setApiData(res.data)
        }

        setLastMeasure(res.data.actual_value)
        setServerConnectOk(true)

      }
      catch (error) {
        console.error(error)
        setApiData([])
        setServerConnectOk(false)
        if (error.response?.status === 401) {
          navigate("/login")
        }
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
        {apiData.measurements_group?.name}
      </h2>

      <div className='flex flex-wrap xl:flex-nowrap px-5 items-center justify-center gap-5 pb-10'>
        <MyChart data={apiData.data} title={"Dane z ostaniej doby"} serverConnectOk={serverConnectOk} endTimestamp={Date.now()} startTimestamp={Date.now() - 24 * 60 * 60 * 1000} resetZoomAtDataChange={false} />

        <SensorCard
          sensorData={{
            id: measurementsGroup,
            measurements_group_name: apiData.measurements_group?.name,
            value: lastMeasure,
            online: lastMeasure ? true : false,

          }}
          hoverEffect={false}
          selected={false}
        />
      </div>
    </motion.div>
  );
};

export default DetailsCard;
