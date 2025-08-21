import React, { useEffect, useState } from 'react';
import { Line } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

import { sensor24h } from '../../../../assets/assets';
import { motion, rgba } from 'framer-motion';
import SensorCard from './SensorCard';
import { assets, liveDataSensors } from '../../../../assets/assets';
import { color } from 'chart.js/helpers';


const DetailsCard = ({ sensor, setLiveDetailsId, selectedSensors, groupMode, groupToggleSensor }) => {
  const sensorData = liveDataSensors.find(sensor => sensor.id === sensor.id);
  const [apiData, setApiData] = useState([]);
  const [online, setOnline] = useState()
  const [lastMeasure, setLastMeasure] = useState()

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    TimeScale
  );

  const dataFillNull = (data) => {
    const interval = 1 / 6 * 60 * 1000
    const halfInterval = interval / 2
    const nowTimestamp = Date.now()
    let startTimestamp = (nowTimestamp - 0.1 * 60 * 60 * 1000)
    let calculatedData = [];
    let foundData;

    startTimestamp = startTimestamp - (startTimestamp % interval)
    data = data.map(d => ({ ...d, timestamp: d.timestamp * 1000 }));


    for (let i = startTimestamp; i < nowTimestamp; i += interval) {
      foundData = data.find(d => (d.timestamp >= (i - halfInterval) && d.timestamp <= (i + halfInterval)))
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
    const fetchData = () => {
      axios
        .get(`http://127.0.0.1:8000/api/devices/get-data-24h/${sensor.id}`)
        .then((res) => {
          setApiData(dataFillNull(res.data))
        })
        .catch((err) => console.error(err));

    };

    // pierwsze pobranie od razu
    fetchData();

    // ustaw polling co 5 sekund
    const interval = setInterval(fetchData, 3000);

    // cleanup
    return () => clearInterval(interval);
  }, []);




  const chartData = {
    labels: apiData.map(a => a.timestamp),

    datasets: [
      {
        // lineTension: 0.4,
        data: apiData.map(a => a.value),
        backgroundColor: 'rgb(255,255,255)',
        borderColor: "rgb(46, 176, 171)",
        pointRadius: 0
      }
    ]
  }

  const chartOptions = {
    scales: {
      x: {
        type: 'time',
        time: {
          unit: "hour"
        },
        grid: {
          display: false,

        },
        title: {
          display: true,
          text: 'Godzina',
          color: "rgb(210, 210, 210)"
        },
        ticks: {
          color: "rgb(210, 210, 210)",
        }

      },
      y: {
        grid: {
          color: "rgb(138, 138, 138)",

        },
        ticks: {
          color: "rgb(210, 210, 210)",
        }
      }
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  console.log(sensor.value)
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
        <div className=' flex-auto min-w-[200px] sm:min-w-[280px] pb-5 pl-5 pr-5 bg-gray-600 rounded-xl'>
          <h2 className='text-center text-gray-300 text-2xl mb-10 mt-3'>Dane z ostatniej doby</h2>
          <Line options={chartOptions} data={chartData} />
        </div>

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
