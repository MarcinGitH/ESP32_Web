import { div } from 'framer-motion/client'
import React, { useEffect, useState } from 'react'
import { assets } from '../../../../assets/assets'

const SensorsConfigList = ({ sensors, onChange }) => {
    const [availablePins,setAvailablePins]=useState([])
    const [deleteQuestion,setDeleteQuestion] = useState([])
    const [sensorIdDeleteAnimation,setSensorIdDeleteAnimation] = useState(0)

    const allPins = Array.from({ length: 15 }, (_, i) => i + 1)
   
    const calculateAvailablePins = ()=>{
        const availablePins = sensors.map(sensor =>{
            const otherSensorsPins = sensors.map(s=>s.pin_number).filter(p=>p !== sensor.pin_number)
            return({
                sensor_id:sensor.id,
                pins:allPins.filter(pin=>!otherSensorsPins.includes(pin)).sort((a,b)=>a-b)
            })})
        return availablePins
    }

    const handleDeleteQuestion = (sensorId, showValue) => {
        setDeleteQuestion(prev => {
            const exists = prev.find(d => d.sensorId === sensorId)
            if (exists) {
                return prev.map(d =>
                    d.sensorId === sensorId ? { ...d, show:showValue } : d)
            } else {
                return [...prev, { sensorId, show:showValue }]
            }
        })
    }
    
    const handleAddSensor = ()=>{
        const newSensor = {
            id: (sensors[sensors.length-1]?.id ?? 0) + 1,
            name: "",
            group_name: null,
            actual_value: null,
            pin_number: -1
          };
        onChange([...sensors, newSensor]);
    }

    useEffect(()=>{
        setAvailablePins(calculateAvailablePins())
    },[sensors])


  const updateSensor = (key, id, value) => {
    const updatedSensors = sensors.map(sensor => {
      if (sensor.id === id) {
        return { ...sensor, [key]: value};
      }
      return sensor;
    });

    onChange(updatedSensors);
  };

  const deleteSensor=(sensorId)=>{
    setSensorIdDeleteAnimation(sensorId)

    setTimeout(() => {
        setSensorIdDeleteAnimation(0)
        onChange(sensors.filter(s=>s.id !== sensorId))
        setDeleteQuestion(prev => {
        const exists = prev.find(d => d.sensorId === sensorId)
        if (exists) {
            return prev.filter(d =>
            d.sensorId !== sensorId)
        } else {
            return prev
        }
    })
    }, 200);
    
  }

  return (
    <div className='relative'>
        <button className='button absolute top-0 right-0'
                type='button'
                onClick={handleAddSensor}>Dodaj</button>
        <h2 className='text-3xl text-gray-300 text-center my-5'>Czujniki</h2>
        <div className='flex flex-row items-center bg-gray-800 py-1 px-5 mx-3'>
            <div className='flex-1 text-center text-xl text-gray-300'>Nazwa</div>
            <div className='flex-1 text-center text-xl text-gray-300'>Grupa</div>
            <div className='flex-1 text-center text-xl text-gray-300'>Numer pinu</div>
        </div>

        {!sensors.length && <div className='text-center text-gray-400 text-3xl py-5 bg-gray-700 rounded-2xl'>Brak skonfigurowanych czujników</div>}
        <div className='flex flex-col bg-gray-700 rounded-2xl max-h-100 overflow-y-auto overflow-x-hidden'>
            {sensors.map(sensor=>(
                <div className={`flex flex-row items-center bg-gray-600 rounded-2xl py-3 my-3 px-5 mx-3 relative transition-all duration-200
                        ${sensor.id === sensorIdDeleteAnimation ? "opacity-0":""}`}
                    key={sensor.id}>
                    <img src={assets.trash} alt="" 
                        className='absolute w-8 right-5 cursor-pointer opacity-60 transition-all hover:rotate-6 hover:opacity-90'
                        onClick={()=>handleDeleteQuestion(sensor.id,true)}/>
                    {/* pytanie czy usunac */}
                    {/* {deleteQuestion.find(d=>d.sensorId === sensor.id)?.show &&  */}
                    <div className={`flex justify-between items-center absolute bg-gray-500 rounded-md border-2 border-gray-400 transition-all duration-200
                                    ${deleteQuestion.find(d=>d.sensorId === sensor.id)?.show ? "right-15 translate-0 opacity-100" : "-right-10 translate-x-full opacity-0"}`}>
                        <p className='text-center text-gray-300 px-5 py-3'>Czy usunąć czujnik?</p>
                        <div className='text-center mx-5'>
                            <button className='button-small'
                                    onClick={()=>deleteSensor(sensor.id)}>
                                    Tak
                            </button>
                            <button className='button-small'
                                    onClick={()=>handleDeleteQuestion(sensor.id,false)}>
                                    Nie
                            </button>
                        </div>
                    </div>
                    <div className='flex-1 text-center'><input type="text" 
                                                                value={sensor.measurements_group?.name} 
                                                                onChange={(e)=>updateSensor("name",sensor.id,e.target.value)}
                                                                className='bg-gray-500 px-2 py-1 rounded-md text-gray-200'/></div>

                    <div className='flex-1 text-center text-gray-200'>{sensor.group_name}</div>
                    <div className='flex-1 text-center'>
                        <select className='bg-gray-500 text-gray-200 px-3 py-2 rounded-md shadow-md cursor-pointer focus:outline-none'
                                value={sensor.pin_number}
                                onChange={(e)=>updateSensor("pin_number",sensor.id,+e.target.value)}>
                            <option key={-1} value={-1}>---</option>
                            {availablePins?.find(ap =>ap.sensor_id === sensor.id)
                                            ?.pins?.map(p=><option key={p} value={p}>{p}</option>)
                            }
                        </select>
                    </div>
                </div>)
            )}
        </div>
    </div>
  )
}

export default SensorsConfigList