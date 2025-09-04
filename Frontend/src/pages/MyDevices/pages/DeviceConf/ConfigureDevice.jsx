import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion';
import axios from 'axios';
import SensorsConfigList from './SensorsConfigList';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import api from '../../../../components/api.js'

const ConfigureDevice = () => {
  const { deviceId } = useParams()
  const [deviceConfig, setDeviceConfig] = useState([])
  const [availMeasureGroups, setAvailMeasureGroups] = useState()
  const [newDeviceConfig, setNewDeviceConfig] = useState()
  const [serverConnectOk, setServerConnectOk] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/devices/get-device-config/${deviceId}`)
        setDeviceConfig(res.data.device)
        setNewDeviceConfig(res.data.device)
        setAvailMeasureGroups(res.data.available_measurement_groups)
        setServerConnectOk(true)
      }
      catch (error) {
        console.error(error)
        setDeviceConfig([])
        setAvailMeasureGroups([])
        setServerConnectOk(false)
        if (error.response?.status === 401) {
          navigate("/login")
        }
      }
    };

    fetchData()
  }, [])

  const handleConfigChange = (sensors, availableMeasurGroups) => {
    setNewDeviceConfig(prev => ({ ...prev, sensors: sensors, available_measurement_groups: availableMeasurGroups }))
  }

  const handleInputChange = (key, value) => {
    setNewDeviceConfig(prev => ({
      ...prev,
      [key]: value
    }));
    console.log(newDeviceConfig)
  };

  const sendConfigToServer = async () => {
    console.log(newDeviceConfig)
    try {
      await toast.promise(
        api.post('/devices/update-device-config', newDeviceConfig),
        {
          pending: {
            render: 'Łączenie z serwerem...',
            className: 'toast-background',
          },
          success: {
            render: 'Ustawienia zostały zapisane. Zrestartuj urządzenie.',
            className: 'toast-background',
          },
          error: {
            render: 'Błąd zapisu',
            className: 'toast-background',
          },
        }
      )
    }
    catch (error) {
      console.error(error)
      if (error.response?.status === 401) {
          navigate("/login")
        }
    }
  }


  return (
    <div className=''>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        theme="dark"
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        transition={Bounce}
      />
      <motion.div
        className='px-1 lg:px-20 mt-10 w-full h-auto'
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        animate={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className='bg-gray-800 rounded-xl my-10 px-5 sm:px-10 max-w-400'>
          {!serverConnectOk ?
            <div>
              <h2 className='text-gray-400 text-4xl mb-10 py-5'>Brak połączenia z serwerem</h2>
            </div>
            :
            <div className='flex flex-col pb-10'>
              {/* Dane urzadzenia */}
              <div>
                <h2 className='text-3xl text-gray-300 text-center mt-5'>Dane urządzenia</h2>
                <p className='text-2xl text-gray-300 my-3'>Numer seryjny: <span className='text-gray-400'>{deviceConfig.device_serial_number}</span></p>
                <p className='text-2xl text-gray-300 my-3'>Nazwa: <span><input type="text" value={newDeviceConfig.name} onChange={(e) => handleInputChange("name", e.target.value)} className='bg-gray-600 text-gray-200 px-2 py-1 rounded-xl w-60 lg:w-100' /></span></p>
              </div>

              {/* Czujniki */}
              <div>
                <SensorsConfigList sensors={newDeviceConfig.sensors} availableMeasureGroups={availMeasureGroups} onChange={handleConfigChange} />

              </div>
              {/* ON/OFF */}
              <div>

              </div>

              <div className='text-right'>
                <button type='button'
                  className='button my-5 ml-5'
                  onClick={sendConfigToServer}>
                  Zapisz
                </button>
                <button type='button'
                  className='button my-5 ml-5'
                  onClick={() => navigate("../device-conf")}>
                  Zamknij
                </button>
              </div>



            </div>}
        </div >
      </motion.div >
    </div >
  )
}

export default ConfigureDevice