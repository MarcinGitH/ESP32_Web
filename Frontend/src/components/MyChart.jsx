import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Line } from "react-chartjs-2";
import zoomPlugin from 'chartjs-plugin-zoom';
import { assets } from '../assets/assets';

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

const MyChart = ({ data, title, filters, serverConnectOk,startTimestamp,endTimestamp}) => {

  const [ctrlKeyDown, setCtrlKeyDown] = useState(false)
  const [chartZoomed, setChartZoomed] = useState(false)
  const [processedData, setProcessedData] = useState([]);
  const chartRef = useRef()
  const fullScreenRef = useRef()
  const dataProbingMinutes = 2

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

  const dataFillNull = (data) => {

    const intervalMs = dataProbingMinutes * 60 * 1000
    const halfIntervalMs = intervalMs / 2
    let calculatedData = [];
    let foundData = [];

    startTimestamp = startTimestamp - (startTimestamp % intervalMs)
    data = data.map(d => ({ ...d, timestamp: d.timestamp * 1000 }));

    // wypelnienie danych nullami
    for (let i = startTimestamp; i < endTimestamp; i += intervalMs) {
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

  const resetZoom = () => {
    chartRef.current.options.scales.x.time.unit = 'hour'
    chartRef.current.resetZoom()
    setChartZoomed(false)
  }

  useEffect(() => {
    const keydown = (e) => {
      if (e.ctrlKey) setCtrlKeyDown(true)
    }
    const keyup = (e) => {
      if (!e.ctrlKey) setCtrlKeyDown(false)
    }

    document.addEventListener("keydown", keydown)
    document.addEventListener("keyup", keyup)
    return (() => {
      document.removeEventListener("keydown", keydown)
      document.removeEventListener("keyup", keyup)
    })
    
  }, []);

  // ustawienie min max na osi y na wykresie
  useEffect(() => {
    if (data.length == 0 || chartZoomed) return

    const range = 2
    const values = data.map(d => d.value).filter(d => d != null)
    const min = Math.min(...values) - range
    const max = Math.max(...values) + range

    chartRef.current.options.scales.y.min = Math.round(min)
    chartRef.current.options.scales.y.max = Math.round(max)

    // Jesli zakres danych mniejszy niz tydzien
    if(endTimestamp-startTimestamp < 7*24*60*60*1000){
      const dataWithNulls = dataFillNull(data);
      const smoothedData = gaussianSmooth(dataWithNulls, 5);
      setProcessedData(smoothedData);
    }
  }, [data])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullScreenRef.current.requestFullscreen()
    }
    else {
      document.exitFullscreen()
    }
  }

  const chartData = useMemo(() => ({
    labels: processedData?.map(a => a.timestamp),
    datasets: [
      {
        data: processedData?.map(a => a.value),
        backgroundColor: 'rgb(255,255,255)',
        borderColor: "rgb(46, 176, 171)",
        pointRadius: 0,

      }
    ]
  }), [processedData])

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: "hour",
          displayFormats: {
            hour: 'HH',
            minute: 'HH:mm',
            second: 'HH:mm:ss',
            day: 'dd MMM'
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
          // stepSize: 0.5,

        }
      }
    },

    plugins: {
      zoom: {
        pan: {
          enabled: true,
          modifierKey: 'ctrl',
          onPan: ({ chart }) => {
            setChartZoomed(true)
          }
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          drag: {
            enabled: true,
            backgroundColor: "rgb(138, 213, 217,0.2)",
            borderColor: "rgb(138, 213, 217)",
            borderWidth: 1,
          },
          pinch: {
            enabled: true
          },
          mode: 'xy',
          onZoom: ({ chart }) => {
            const xScale = chart.scales.x;
          
            const range = xScale.max - xScale.min;

            // Jeśli zakres < 1 minuty - [hh:mm:ss]
            if (range < 1 * 60 * 1000) {
              xScale.options.time.unit = 'second';
              xScale.options.title.text = "Godzina"
            }
            // Jeśli zakres < 1 godziny - [hh:mm]
            else if (range < 1 * 60 * 60 * 1000) {
              xScale.options.time.unit = 'minute';
              xScale.options.title.text = "Godzina"
            }
            // Jesli zakres < 3 dni
            else if(range < 3*24 * 60 * 60 * 1000) {
              xScale.options.time.unit = 'hour';
              xScale.options.title.text = "Godzina"
            }
            else{
              xScale.options.time.unit = 'day';
              xScale.options.title.text = "Dzień"
            }
            setChartZoomed(true)
            chart.update('none'); // update bez animacji
          },
        },
      }
    }
  }), [])


  return (
    <div className=' flex-auto h-100 sm:h-100 md:h-120 lg:h-150 min-w-[200px] sm:min-w-[280px] pb-25 pl-5 pr-5 bg-gray-600 rounded-xl relative'
      ref={fullScreenRef}>
      {!serverConnectOk &&
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 px-10 py-10 w-max rounded-3xl'>
          <h2 className='text-3xl text-gray-300'>Brak połączenia z serwerem</h2>
        </div>
      }
      {chartZoomed &&
        <button type='button'
          className='absolute top-5 right-20 text-xs lg:text-xl px-3 py-2 text-gray-300 bg-cyan-700 rounded-xl hover:bg-cyan-600 cursor-pointer font-bold'
          onClick={() => resetZoom()}
        >Zoom reset</button>
      }
      <img src={assets.expand} alt="" className='w-10 absolute top-2 right-2 cursor-pointer transition-all opacity-70 duration-200 hover:scale-110 hover:opacity-100'
        onClick={toggleFullscreen} />

      <h2 className='text-center text-gray-300 text-l md:text-2xl mb-10 mt-3'>{title}</h2>
      <Line ref={chartRef} options={chartOptions} data={chartData} className={ctrlKeyDown ? "hover:cursor-move" : ""} />
    </div>
  )
}

export default MyChart