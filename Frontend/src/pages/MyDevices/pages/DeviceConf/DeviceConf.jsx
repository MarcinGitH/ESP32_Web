import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import { assets } from '../../../../assets/assets'
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import api from '../../../../components/api.js'

const DeviceConf = () => {
  const [devicesList, setDevicesList] = useState([])
  const [allGroupList, setAllGroupList] = useState([])
  const [availableGroupList, setAvailableGroupList] = useState([])
  const [serverConnectOk, setServerConnectOk] = useState([])
  const [deleteQuestion, setDeleteQuestion] = useState([])
  const onceFetch = useRef(false)
  const [deleteAnimationId, setDeleteAnimationId] = useState({ id: -1, list_name: "-1" })
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/devices/get-devices`)

        setDevicesList(res.data.devices)
        if (!onceFetch.current) {
          onceFetch.current = true
          setAllGroupList(res.data.all_measurement_groups)
        }

        setAvailableGroupList(res.data.available_measurement_groups)
        setServerConnectOk(true)

      }
      catch (error) {
        console.error(error)
        setDevicesList([])
        setAllGroupList([])
        setAvailableGroupList([])
        setServerConnectOk(false)
        if (error.response?.status === 401) {
          navigate("/login")
        }
      }
    };

    fetchData()

    // const interval = setInterval(fetchData, 5000);

    // return () => clearInterval(interval)

  }, [])


  const handleDeleteQuestion = (id, listName, showValue) => {
    setDeleteQuestion(prev => {
      const exists = prev.find(d => d.id === id)
      if (exists) {
        return prev.map(d =>
          d.id === id ? { ...d, list_name: listName, show: showValue } : d)
      } else {
        return [...prev, { id, list_name: listName, show: showValue }]
      }
    })

  }

  const deleteListItem = (id, listName) => {
    setDeleteAnimationId({ id: id, list_name: listName })

    // timout zeby animacja wygaszania sensora miala czas
    setTimeout(() => {
      setDeleteAnimationId({ id: -1, list_name: "-1" })

      if (listName === "group") {
        setAllGroupList(prev => prev.filter(p => p.id !== id))
      }
      else if (listName === "device") {
        setDevicesList(prev => prev.filter(p => p.id !== id))
      }


      setDeleteQuestion(prev => {
        const exists = prev.find(d => d.id === id && d.list_name === listName)
        if (exists) {
          return prev.filter(d =>
            !(d.id === id && d.list_name === listName))
        } else {
          return prev
        }
      })
    }, 200);

  }

  const handleInputChange = (value, id) => {
    setAllGroupList(prev => prev.map(p => p.id === id ? { id: id, name: value } : p))
  }

  const handleAddGroup = () => {
    let next_minus_id = allGroupList.map(a => a.id).sort((a, b) => a - b)[0] - 1
    if (next_minus_id >= 0 || Number.isNaN(next_minus_id)) {
      next_minus_id = -1
    }
    console.log(next_minus_id)

    setAllGroupList(prev => [{ id: next_minus_id, name: "" }, ...prev])
  }

  const sendGroups = async () => {
    try {

      await toast.promise(
        api.post('/devices/update-measure-groups', allGroupList),
        {
          pending: {
            render: 'Łączenie z serwerem...',
            className: 'toast-background',
          },
          success: {
            render: 'Grupy zostały zapisane',
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

  const sendDevices = async () => {
    try {
      await toast.promise(
        api.post('/devices/delete-devices', devicesList), //wyslane maja pozostac
        {
          pending: {
            render: 'Łączenie z serwerem...',
            className: 'toast-background',
          },
          success: {
            render: 'Lista urządzeń została zapisana',
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
                className='button my-5'
                onClick={() => navigate("./add-new")}>Dodaj urządzenie</button>
            </div>
            {/* Lista urzadzen */}
            <div className='overflow-y-auto max-h-150'>
              {!serverConnectOk ?
                <div>
                  <h2 className='text-gray-400 text-4xl mb-10'>Brak połączenia z serwerem</h2>
                </div>
                : !devicesList.length ?
                  <div>
                    <h2 className='text-gray-400 text-4xl mb-10'>Brak skonfigurowanych urządzeń</h2>
                  </div>
                  :
                  <div>
                    <div className='hidden md:flex flex-row items-center bg-gray-800 py-1 px-5 mx-3'>
                      <div className='flex-1 text-center text-xl text-gray-300'>Nazwa</div>
                      <div className='flex-1 text-center pr-5 text-xl text-gray-300'>Skonfigurowane czujniki</div>
                      <div className='flex-1 text-center pr-5 text-xl text-gray-300'>Status</div>
                    </div>
                    <div className=' px-3 py-2 border-2 border-gray-500 rounded-3xl overflow-y-auto overflow-x-hidden'>
                      {devicesList.map((device, id) => (
                        <div key={id}
                          className={`flex flex-col lg:flex-row items-center gap-4 bg-gray-700 px-10 my-5 py-5 rounded-2xl cursor-pointer hover:bg-gray-600 relative transition-all duration-200
                                    ${device.id === deleteAnimationId.id && deleteAnimationId.list_name === "device" ? "opacity-0" : ""}`}
                          onClick={() => navigate(`./configure-device/${device.id}`)}>
                          {/* // obsluga usuwania */}
                          <img src={assets.trash} alt=""
                            className='absolute w-8 right-2 sm:right-5 bottom-2 sm:top-1/2 sm:-translate-y-1/2 cursor-pointer z-100 opacity-60 transition-all hover:rotate-6 hover:opacity-90'
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteQuestion(device.id, "device", true)
                            }} />
                          <div className={`flex justify-between items-center absolute top-1/2 -translate-y-1/2 bg-gray-500 rounded-md border-2 border-gray-400 transition-all duration-200
                                          ${deleteQuestion.find(d => d.id === device.id && d.list_name === "device")?.show ? "right-15 translate-0 opacity-100" : "-right-10 translate-x-full opacity-0"}`}>
                            <p className='text-center text-gray-300 px-5 py-3'>Czy usunąć urządzenie?</p>
                            <div className='text-center mx-1 sm:mx-5'>
                              <button className='button-small'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteListItem(device.id, "device")
                                }}>
                                Tak
                              </button>
                              <button className='button-small'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteQuestion(device.id, "device", false)
                                }}>
                                Nie
                              </button>
                            </div>
                          </div>


                          <div className='flex-1'>
                            <h2 className='text-gray-300 text-xl lg:text-xl text-center'>{device.name}</h2>
                          </div>
                          <div className='flex-1'>
                            <h3 className='text-gray-300 px-20 text-xl text-center'>{device.sensors.length}</h3>
                          </div>
                          <div className='flex-1'>
                            <p className='text-gray-300 text-xl text-center'>{device.online ? <span className='text-green-600 text-xl'>Online</span> : <span className='text-gray-400 text-xl'>Offline</span>}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>}
              <div className='text-right'>
                <button type='button'
                  className='button my-5 ml-5'
                  onClick={sendDevices}>
                  Zapisz
                </button>
              </div>
            </div>
            {/* Grupa pomiarow */}
            <div className='mt-5'>
              <h2 className='text-center text-3xl text-gray-300 mt-15 font-bold'>Grupy pomiarów</h2>
              <button type='button'
                className='button my-5'
                onClick={handleAddGroup}>Dodaj grupę</button>
            </div>

            <div className=''>
              {!serverConnectOk ?
                <div>
                  <h2 className='text-gray-400 text-4xl mb-10'>Brak połączenia z serwerem</h2>
                </div>
                : !allGroupList.length ?
                  <div>
                    <h2 className='text-gray-400 text-4xl mb-10'>Brak grup pomiarów</h2>
                  </div>
                  :
                  <div>
                    <div className='hidden md:flex flex-row items-center bg-gray-800 py-1 px-5 mx-3'>
                      <div className='flex-1 text-center text-xl text-gray-300'>Grupa pomiarów</div>
                      <div className='flex-1 text-center pr-5 text-xl text-gray-300'>Przypisanie do czujnika</div>
                    </div>
                    <div className=' px-3 py-2 border-2 border-gray-500 rounded-3xl overflow-y-auto overflow-x-hidden max-h-150'>
                      {allGroupList.map((group) => (


                        <div key={group.id}
                          className={`flex flex-col lg:flex-row items-center gap-4 bg-gray-700 px-10 my-5 py-4 rounded-2xl relative transition-all duration-200
                              ${group.id === deleteAnimationId.id && deleteAnimationId.list_name === "group" ? "opacity-0" : ""}`} >
                          {/* // obsluga usuwania */}
                          <img src={assets.trash} alt=""
                            className='absolute w-8 right-2 sm:right-5 bottom-2 sm:top-1/2 sm:-translate-y-1/2 cursor-pointer opacity-60 transition-all hover:rotate-6 hover:opacity-90'
                            onClick={() => handleDeleteQuestion(group.id, "group", true)} />
                          <div className={`flex justify-between items-center absolute top-1/2 -translate-y-1/2 bg-gray-500 rounded-md border-2 border-gray-400 transition-all duration-200
                                          ${deleteQuestion.find(d => d.id === group.id && d.list_name === "group")?.show ? "right-15 translate-0 opacity-100" : "-right-10 translate-x-full opacity-0"}`}>
                            <p className='text-center text-gray-300 px-5 py-3'>Czy usunąć grupę? Stracisz wszystkie pomiary</p>
                            <div className='text-center mx-1 sm:mx-5'>
                              <button className='button-small'
                                onClick={() => deleteListItem(group.id, "group")}>
                                Tak
                              </button>
                              <button className='button-small'
                                onClick={() => handleDeleteQuestion(group.id, "group", false)}>
                                Nie
                              </button>
                            </div>
                          </div>

                          <div className='flex-1 text-center'>
                            <input className='text-gray-300 bg-gray-500 rounded-md text-2xl px-2 py-1 lg:text-xl'
                              value={group.name}
                              onChange={(e) => handleInputChange(e.target.value, group.id)} />
                          </div>
                          <div className='flex-1'>
                            <h3 className={` px-20 text-xl text-center ${availableGroupList.find(a => a.id === group.id) || group.id < 0 ? "text-gray-400" : "text-green-600"}`}>
                              {availableGroupList.find(a => a.id === group.id) || group.id < 0 ? "Nie" : "Tak"}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>}
              <div className='text-right'>
                <button type='button'
                  className='button my-5 ml-5'
                  onClick={sendGroups}>
                  Zapisz
                </button>
              </div>

            </div>

          </div>
        </div >
      </motion.div >
    </div >
  )
}

export default DeviceConf