import React, { useEffect } from 'react';
import { Line } from "react-chartjs-2";
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


const DetailsCard = ({ id, setLiveDetailsId, selectedSensors, groupMode, groupToggleSensor, liveDetailsId }) => {
  const sensorData = liveDataSensors.find(sensor => sensor.id === id);


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

    // Przygotowanie label x z timestampami co 5 min 24h wstecz
    const xLabel = []
    const interval = 5*60*1000
    const halfInterval = interval/2
    const timestampBefore24h = Date.now()-(24*60*60*1000)
    for(let i = timestampBefore24h;i < Date.now();i = i+interval){
        xLabel.push(i)
    }

    // Przygotowanie tablicy danych przypisanych do timestampow xLabel
    const dataset=[]

    


    
    const data = {
        labels:xLabel,
        
        datasets:[
            {
                data:sensor24h.map(s=>s.value),
                backgroundColor:'rgb(255,255,255)',
                borderColor:"rgb(46, 176, 171)",
                pointRadius:0
            }
        ]
    }

    const options = {
    scales: {
      x: {
        type: 'time',
        time:{
            unit:"hour"
        },
        grid:{
            display:false,
            
        },
        title:{
            display:true,
            text:'Godzina',
            color:"rgb(210, 210, 210)"
        },
        ticks:{
            color:"rgb(210, 210, 210)",
        }

      },
      y:{
        grid:{
            color:"rgb(138, 138, 138)",
            
        },
        ticks:{
            color:"rgb(210, 210, 210)",
        }
      }
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
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
        {sensorData.name}
      </h2>

      <div className='flex flex-wrap xl:flex-nowrap px-5 items-center justify-center gap-5'>
        <div className=' flex-auto min-w-[200px] sm:min-w-[280px] pb-5 pl-5 pr-5 bg-gray-600 rounded-xl'>
          <h2 className='text-center text-gray-300 text-2xl mb-10 mt-3'>Dane z ostatniej doby</h2>
          <Line options={options} data={data}/>
        </div>

        <SensorCard
          data={sensorData}
          selectedSensors={selectedSensors}
          groupMode={groupMode}
          groupToggleSensor={groupToggleSensor}
          liveDetailsId={liveDetailsId}
          setLiveDetailsId={setLiveDetailsId}
        />
      </div>
    </motion.div>
  );
};

export default DetailsCard;
