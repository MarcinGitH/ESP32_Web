import React, { useEffect, useState } from 'react'
import axios from 'axios';

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DeviceConf = () => {
  const [devicesList, setDevicesList] = useState([])
  const [serverConnectOk, setServerConnectOk] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/devices/get-devices`)

        setDevicesList(res.data)
        setServerConnectOk(true)
      }
      catch (error) {
        console.error(error)
        setDevicesList([])
        setServerConnectOk(false)
      }
    };

    fetchData()

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval)

  }, [])

  return (
    <div className=''>
      <motion.div
        className='px-1 sm:px-20 mt-10 w-full h-auto'
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        animate={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className='bg-gray-800 rounded-xl my-10 px-5 sm:px-10 max-w-400'>
          <div className='flex flex-col pb-10'>
            {/* Dodaj urzadzenie */}
            <div>
              <h2 className='text-center text-3xl text-gray-300 mt-5 font-bold'>Lista urządzeń</h2>
              <button type='button'
                className='button mb-5'
                onClick={() => navigate("./add-new")}>Dodaj urządzenie</button>
            </div>
            {/* Lista urzadzen */}
            <div>
              {!serverConnectOk ?
                <div>
                  <h2 className='text-gray-400 text-4xl mb-10'>Brak połączenia z serwerem</h2>
                </div>
                : !devicesList.length ?
                  <div>
                    <h2 className='text-gray-400 text-4xl mb-10'>Brak skonfigurowanych urządzeń</h2>
                  </div>
                  :
                  <div className=''>
                    {devicesList.map((device, id) => (
                      <div key={id}
                        className='flex flex-col lg:flex-row items-center gap-4 bg-gray-700 px-10 my-5 py-8 rounded-2xl cursor-pointer hover:bg-gray-600'
                        onClick={() => navigate(`./configure-device/${device.id}`)}>
                        <div className='flex-1'>
                          <h2 className='text-gray-300 text-2xl lg:text-2xl font-bold text-center'>{device.name}</h2>
                        </div>
                        <div className='flex-1'>
                          <h3 className='text-gray-300 px-20 text-xl text-center'>Skonfigurowane czujniki: {device.sensors.length}</h3>
                        </div>
                        <div className='flex-1'>
                          <p className='text-gray-300 text-xl text-center'>Status: {device.online ? <span className='text-green-600 text-xl'>Online</span> : <span className='text-gray-200 text-xl'>Offline</span>}</p>
                        </div>
                      </div>
                    ))}
                  </div>}
            </div>

          </div>
        </div >
      </motion.div >
    </div >
  )
}

export default DeviceConf