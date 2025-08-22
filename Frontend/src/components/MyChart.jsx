import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Line } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  TimeScale,
  plugins
} from 'chart.js';
import 'chartjs-adapter-date-fns';

const MyChart = ({data,title,filters,serverConnectOk}) => {

  const [ctrlKeyDown,setCtrlKeyDown] = useState(false)
  const [chartZoomed,setChartZoomed] = useState(false)
  const chartRef = useRef()

  ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      PointElement,
      LineElement,
      ArcElement,
      Tooltip,
      TimeScale,
      zoomPlugin
    );
  // if(!data) data=[]


  const resetZoom = ()=>{
      chartRef.current.options.scales.x.time.unit = 'hour'
      chartRef.current.resetZoom()
      setChartZoomed(false)
    }
  
    useEffect(() => {
      const keydown = (e)=>{
        if(e.ctrlKey) setCtrlKeyDown(true)
      }
      const keyup = (e)=>{
        if(!e.ctrlKey) setCtrlKeyDown(false)
      }

      document.addEventListener("keydown",keydown)
      document.addEventListener("keyup",keyup)
      return(()=>{
        document.removeEventListener("keydown",keydown)
        document.removeEventListener("keyup",keyup)
    })
    }, []);
  
  
    const chartData =useMemo(()=> ({
      labels: data.map(a => a.timestamp),
  
      datasets: [
        {
          // lineTension: 0.4,
          data: data.map(a => a.value),
          backgroundColor: 'rgb(255,255,255)',
          borderColor: "rgb(46, 176, 171)",
          pointRadius: 0
        }
      ]
    }),[data])
  
    const chartOptions = useMemo(()=>({
      responsive:true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: "hour",
            displayFormats: {
                          hour: 'HH',
                          minute: 'HH:mm'
                      }
          },
          grid: {
            display: true,
            color: "rgb(100, 100, 100)",
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
            color: "rgb(100, 100, 100)",
  
          },
          ticks: {
            color: "rgb(210, 210, 210)",
          }
        }
      },
  
      plugins: {
        zoom: {
          pan:{
            enabled:true,
            modifierKey:'ctrl'
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            drag:{
              enabled:true,
              backgroundColor:"rgb(138, 213, 217,0.2)",
              borderColor:"rgb(138, 213, 217)",
              borderWidth:1,
            },
            pinch: {
              enabled: true
            },
            mode: 'xy',
  
            onZoom: ({chart}) => {
            const xScale = chart.scales.x;
            const range = xScale.max - xScale.min;
            // Jeśli zakres < 1.5 godziny - [hh:mm]
            if (range < 1.5*60 * 60 * 1000) {
              xScale.options.time.unit = 'minute';
            } 
            else {
              xScale.options.time.unit = 'hour';
            }
  
            setChartZoomed(true)
            chart.update('none'); // update bez animacji
            },
            
          },
          
  
        }
      }
  
    }),[])


  return (
        <div className=' flex-auto h-100 sm:h-100 md:h-120 lg:h-150 min-w-[200px] sm:min-w-[280px] pb-25 pl-5 pr-5 bg-gray-600 rounded-xl relative'>
          {!serverConnectOk && 
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-10 py-10 w-max rounded-3xl'>
            <h2 className='text-3xl text-gray-300'>Brak połączenia z serwerem</h2>
          </div>
          }
          {chartZoomed &&
          <button type='button' 
                  className='absolute top-10 right-5 text-xl px-3 py-2 text-gray-300 bg-cyan-700 rounded-xl hover:bg-cyan-600 cursor-pointer font-bold'
                  onClick={()=>resetZoom()}
                  >Zoom reset</button>
          }
          

          <h2 className='text-center text-gray-300 text-l md:text-2xl mb-10 mt-3'>{title}</h2>
          <Line ref={chartRef} options={chartOptions} data={chartData} className={ctrlKeyDown ? "hover:cursor-move":""} />
        </div>
    )
}

export default MyChart