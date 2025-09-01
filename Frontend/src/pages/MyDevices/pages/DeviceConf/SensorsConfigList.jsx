import { div } from 'framer-motion/client'
import React, { useEffect, useState } from 'react'
import { assets } from '../../../../assets/assets'

const SensorsConfigList = ({ sensors, availableMeasureGroups, onChange }) => {
    const [availablePins, setAvailablePins] = useState([])
    const [measurGroup, setMeasurGroup] = useState([])
    const [deleteQuestion, setDeleteQuestion] = useState([])
    const [sensorIdDeleteAnimation, setSensorIdDeleteAnimation] = useState(0)

    const allPins = Array.from({ length: 15 }, (_, i) => i + 1)


    // Generowanie przypisania dostepnych pinow dla sensora
    // [
    //     {
    //         sensor_id:1,
    //         pins:[1,2,3,4,5]
    //     }
    // ]
    const calculateAvailablePins = () => {
        const availablePins = sensors.map(sensor => {
            const otherSensorsPins = sensors.map(s => s.pin_number).filter(p => p !== sensor.pin_number)
            return ({
                sensor_id: sensor.sensor_id,
                pins: allPins.filter(pin => !otherSensorsPins.includes(pin)).sort((a, b) => a - b)
            })
        })
        return availablePins
    }


    // Generowanie dostepnych grup pomiarow dla sensorow
    // [
    //     {
    //         sensor_id:1,
    //         available_measure_groups:[
    //             {
    //                 id:1,
    //                 name:"Nazwa"
    //             }
    //         ]
    //     }
    // ]

    const calculateMeasurGroup = () => {
        return sensors.map(sensor => {
            let groups = [...availableMeasureGroups];

            if (sensor.measurements_group?.id > 0) {
                const exists = groups.some(g => g.id === sensor.measurements_group.id);
                if (!exists) {
                    groups.push(sensor.measurements_group);
                }
            }

            return {
                sensor_id: sensor.sensor_id,
                available_measure_groups: groups.sort((a, b) => a.name.localeCompare(b.name))
            };
        });
    };


    const handleDeleteQuestion = (sensorId, showValue) => {
        setDeleteQuestion(prev => {
            const exists = prev.find(d => d.sensorId === sensorId)
            if (exists) {
                return prev.map(d =>
                    d.sensorId === sensorId ? { ...d, show: showValue } : d)
            } else {
                return [...prev, { sensorId, show: showValue }]
            }
        })
        
    }

    const handleAddSensor = () => {
        // obliczanie pierwszego wolnego sensor_id
        let lowestFreeId = -1
        const sortedSensorsId = sensors.map(s=>s.sensor_id).sort((a,b)=>a-b)
        for(let i = 1;i<=sortedSensorsId.length+1;i++){
            if(!sortedSensorsId.includes(i)){
                lowestFreeId = i
                break
            }
        }



        const newSensor = {
            id:null,
            // sensor_id: (sensors[sensors.length - 1]?.sensor_id ?? 0) + 1,
            sensor_id: lowestFreeId,
            measurements_group: {
                id: -1,
                name: null
            },
            group_name: "Inne",
            actual_value: null,
            pin_number: -1,
            
        };

        onChange([...sensors, newSensor], availableMeasureGroups);
    }

    useEffect(() => {
        setAvailablePins(calculateAvailablePins())
        setMeasurGroup(calculateMeasurGroup())
    }, [sensors, availableMeasureGroups])



    const updateSensor = (key, id, value) => {
       
        // zmiana parametrow sensora
        const updatedSensors = sensors.map(sensor => {
            if (sensor.sensor_id === id) {
                return { ...sensor, [key]: value };
            }
            return sensor;
        });

        // Po wyborze usun wybrany element z dostepnych grup a zwolniony element dodaj
        let aMG = availableMeasureGroups
        if (key === "measurements_group") {
            const reducedAMG = availableMeasureGroups.filter(a => a.id !== value.id)
            const sensor = sensors.find(s => s.sensor_id === id)
            aMG = sensor.measurements_group?.id > 0 ? [...reducedAMG, sensor.measurements_group] : reducedAMG
        }


        onChange(updatedSensors, aMG);
    };



    const deleteSensor = (sensorId) => {
        setSensorIdDeleteAnimation(sensorId)

        // timout zeby animacja wygaszania sensora miala czas
        setTimeout(() => {
            setSensorIdDeleteAnimation(0)
            // dodanie grupy pomiarow ktora byla przy usunietym sensorze
            const sensor = sensors.find(s => s.sensor_id === sensorId)
            const aMG = sensor.measurements_group.id > 0 ? [...availableMeasureGroups, sensor.measurements_group] : availableMeasureGroups

            onChange(sensors.filter(s => s.sensor_id !== sensorId), aMG)
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
        <div>
            <div className='flex sm:block items-center justify-between relative'>
                <h2 className='text-3xl text-gray-300 text-center my-5'>Czujniki</h2>
                <button className='button sm:absolute top-0 right-0'
                    type='button'
                    onClick={handleAddSensor}>Dodaj</button>
            </div>

            <div className='hidden md:flex flex-row items-center bg-gray-800 py-1 px-5 mx-3'>
                {/* <div className='flex-1 text-center text-xl text-gray-300'>Nazwa</div> */}
                <div className='flex-1 text-center text-xl text-gray-300'>Grupa pomiarów</div>
                <div className='flex-1 text-center text-xl text-gray-300'>Numer pinu</div>
            </div>

            {!sensors.length && <div className='text-center text-gray-400 text-3xl py-5 bg-gray-700 rounded-2xl'>Brak skonfigurowanych czujników</div>}
            <div className='flex flex-col bg-gray-700 rounded-2xl max-h-100 overflow-y-auto overflow-x-hidden'>
                {sensors.map(sensor => (
                    // obsluga usuwania
                    <div className={`flex flex-col md:flex-row items-center bg-gray-600 rounded-2xl py-3 my-3 px-5 mx-3 relative transition-all duration-200
                        ${sensor.sensor_id === sensorIdDeleteAnimation ? "opacity-0" : ""}`}
                        key={sensor.sensor_id}>
                        <img src={assets.trash} alt=""
                            className='absolute w-8 right-2 sm:right-5 bottom-2 sm:top-1/2 sm:-translate-y-1/2 cursor-pointer opacity-60 transition-all hover:rotate-6 hover:opacity-90'
                            onClick={() => handleDeleteQuestion(sensor.sensor_id, true)} />
                        <div className={`flex justify-between items-center absolute top-1/2 -translate-y-1/2 bg-gray-500 rounded-md border-2 border-gray-400 transition-all duration-200
                                    ${deleteQuestion.find(d => d.sensorId === sensor.sensor_id)?.show ? "right-15 translate-0 opacity-100" : "-right-10 translate-x-full opacity-0"}`}>
                            <p className='text-center text-gray-300 px-5 py-3'>Czy usunąć czujnik?</p>
                            <div className='text-center mx-1 sm:mx-5'>
                                <button className='button-small'
                                    onClick={() => deleteSensor(sensor.sensor_id)}>
                                    Tak
                                </button>
                                <button className='button-small'
                                    onClick={() => handleDeleteQuestion(sensor.sensor_id, false)}>
                                    Nie
                                </button>
                            </div>
                        </div>

                        {/* parametry czujnika */}
                        {/* <p className='md:hidden text-left w-full text-xl text-gray-300'>Nazwa:</p>
                        <div className='flex-1 text-center'><input type="text"
                            value={sensor.measurements_group?.name}
                            onChange={(e) => updateSensor("name", sensor.id, e.target.value)}
                            className='bg-gray-500 w-full sm:w-full px-2 py-1  rounded-md text-gray-200' /></div> */}

                        <p className='md:hidden text-left w-full text-xl text-gray-300'>Grupa pomiarów:</p>
                        {/* <div className='flex-1 text-center text-gray-200 mb-3'>{sensor.group_name}</div> */}
                        <div className='flex-1 text-center'>
                            <select className='bg-gray-500 text-gray-200 px-3 py-2 rounded-md shadow-md cursor-pointer focus:outline-none'
                                value={sensor.measurements_group?.id}
                                onChange={(e) => updateSensor("measurements_group", sensor.sensor_id, measurGroup.find(m => m.sensor_id === sensor.sensor_id).available_measure_groups.find(a => a.id === +e.target.value) || { id: -1, name: null })}
                            >
                                <option key={-1} value={{ id: -1, name: null }}>---</option>
                                {measurGroup.find(m => m.sensor_id === sensor.sensor_id)?.available_measure_groups
                                    .map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>

                        </div>


                        <p className='md:hidden text-left w-full text-xl text-gray-300'>Numer pinu:</p>
                        <div className='flex-1 text-center'>
                            <select className='bg-gray-500 text-gray-200 px-3 py-2 rounded-md shadow-md cursor-pointer focus:outline-none'
                                value={sensor.pin_number}
                                onChange={(e) => updateSensor("pin_number", sensor.sensor_id, +e.target.value)}>
                                <option key={-1} value={-1}>---</option>
                                {availablePins?.find(ap => ap.sensor_id === sensor.sensor_id)
                                    ?.pins?.map(p => <option key={p} value={p}>{p}</option>)
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