import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import MyChart from '../../../../components/MyChart'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import api from '../../../../components/api.js'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { div } from 'framer-motion/client'
import useAuth from '../UserHandler/useAuth.jsx'

const Dashboard = () => {
  const [chartTitle,setChartTitle] = useState("")
  const [serverConnectOk,setServerConnectOK] = useState(false)
  const [chartData,setChartData] = useState([])
  const [measureGroups,setMeasureGroups] = useState()
  const [selectedGroup,setSelectedGroup] = useState(-1)
  const [startDate, setStartDate] = useState( new Date(Date.now() - 24*60*60*1000))
  const [endDate, setEndDate] = useState(new Date())


  useAuth();

  useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await api.get("/measure-groups")
        setMeasureGroups(response.data.sort((a,b)=>a.name.localeCompare(b.name)))
        setServerConnectOK(true)
      }
      catch (error) {
        console.log(error)
        setServerConnectOK(false)
        
      }
    }

    fetchData()

  }, [])


  const getChartData = async () => {
    if (selectedGroup == -1) {
      toast.error("Wybierz grupę pomiarów")
      return
    }
    else if (!startDate || !endDate) {
      toast.error("Wybierz datę")
      return
    }
    else if (startDate > endDate) {
      toast.error("Nieprawidłowy zakres dat")
      return
    }

    try {
      const response = await api.get(`measure-groups/${selectedGroup}/data`, {
        params: {
          start_date: startDate.toLocaleString("sv-SE"),
          end_date: endDate.toLocaleString("sv-SE"),
        },
      })
      setChartData(response.data)
      setServerConnectOK(true)
      setChartTitle(measureGroups?.find(m=>m.id == selectedGroup)?.name)
    }
    catch (error) {
      console.log(error)
      setServerConnectOK(false)
    }


  }


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
      {/* wykres z zakresem dat i wyborem danych */}
      <motion.div
        className='flex flex-col justify-center px-1 sm:px-20 mt-10'
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        animate={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className='flex flex-col gap-5 bg-gray-800 rounded-xl py-10 my-10 sm:px-10'>
          {/* filtry */}
          <div className='bg-gray-600 w-full py-5 px-5 rounded-2xl'>
            <h2 className='text-gray-300 mb-5 text-3xl text-center font-bold'>Filtry</h2>
            <div className='flex items-center justify-between flex-wrap'>
              {/* grupy pomiarow */}
              <div className='text-center'>
                <p className='text-gray-300 text-2xl px-5 mb-2'>Grupa pomiarów:</p>
                <select className='custom-select block mx-auto'
                  onChange={(e) => {
                    setSelectedGroup(e.target.value)
                    setChartData([])
                  }}>
                  <option key={-1} value={-1}>---</option>
                  {measureGroups?.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>
              {/* data od */}
              <div className='text-center'>
                <p className='text-gray-300 text-2xl px-5 mb-2'>Pomiar od:</p>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  showTimeSelect
                  scrollableYearDropdown
                  showYearDropdown
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  className="bg-gray-500 text-gray-300 text-center px-3 py-2 rounded-lg cursor-pointer"
                  calendarClassName="bg-gray-800 text-gray-300 rounded-xl shadow-lg"
                />
              </div>
              {/* data do */}
              <div className='text-center'>
                <p className='text-gray-300 text-2xl px-5 mb-2'>Pomiar do:</p>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  showTimeSelect
                  scrollableYearDropdown
                  showYearDropdown
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="yyyy-MM-dd HH:mm"
                  className="bg-gray-500 text-gray-300 text-center px-3 py-2 rounded-lg cursor-pointer"
                  calendarClassName="bg-gray-800 text-gray-300 rounded-xl shadow-lg"
                />
              </div>
              <button className='button h-15'
                onClick={getChartData}>
                Szukaj
              </button>
            </div>

          </div>
          {!serverConnectOk ?
            <div className=' bg-gray-800 px-10 py-10 w-max rounded-3xl'>
              <h2 className='text-3xl text-gray-300'>Brak połączenia z serwerem</h2>
            </div>
          :
            chartData.length>0 && chartData.filter(d => d.value!=null).length>0 ?
            <div>
              <MyChart data={chartData} title={chartTitle} serverConnectOk={serverConnectOk} startTimestamp={startDate} endTimestamp={endDate}/>
            </div>
            :
            <div className=' bg-gray-800 px-10 py-10 w-max rounded-3xl'>
              <h2 className='text-3xl text-gray-300'>Brak danych do wyświetlenia</h2>
            </div>
            
          }
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard