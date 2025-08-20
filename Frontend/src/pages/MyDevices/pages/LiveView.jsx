import React, { useState } from 'react'
import { liveDataSensors } from '../../../assets/assets'


const LiveView = () => {
  const [groupMode, setGroupMode] = useState(false)
  const [selectedSensors, setSelectedSensors] = useState([])
  const [groupName, setGroupName] = useState("")

  // Zarządza tablicą selectedSensors przy klikaniu w karty
  const groupToggleSensor = (id) => {
    setSelectedSensors(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  // Zeruje wybory kart przy anulowaniu
  const cancelGroup = () => {
    setSelectedSensors([])
    setGroupMode(false)
    setGroupName("")
  }

  // Aktualizuje grupy w sensorach
  const confirmGroup = () => {
    liveDataSensors.forEach(data => {
      if (selectedSensors.includes(data.id)) {
        data.groupName = groupName
      }
    })
    cancelGroup()
  }

  // Przygotowanie listy grup
  const groups = [
    ...new Set(liveDataSensors.filter(d => d.groupName !== "Inne").map(d => d.groupName)),
    ...(liveDataSensors.some(d => d.groupName === "Inne") ? ["Inne"] : [])
  ]

  
  // Komponent pojedynczej karty sensora
  const SensorCard = ({ data }) => (
    <div
      className={`flex flex-col justify-start w-70 py-2 rounded-xl cursor-pointer transition-all hover:-translate-y-2 hover:bg-gray-500
        ${selectedSensors.includes(data.id) ? "-translate-y-2 bg-gray-500 border-3 border-gray-300" : "bg-gray-600"}`}
      onClick={groupMode ? () => groupToggleSensor(data.id) : undefined}
    >
      <span className='text-gray-300 text-center block mt-2 px-4 font-bold text-xl'>{data.name}</span>
      <span className='block text-center text-gray-400 mt-20 font-[Orbitron] text-6xl'>{data.value}</span>
      <span className={`block text-center text-gray-400 mt-20 text-3xl ${data.online ? "text-green-600" : "text-red-800"}`}>
        {data.online ? "Online" : "Offline"}
      </span>
    </div>
  )

  // Komponent grupy sensorów
  const SensorGroup = ({ group }) => (
    <div>
        <h2 className='text-gray-300 text-3xl font-bold ml-10 my-10'>{group}</h2>

        <div className='flex flex-wrap pb-10 px-10 gap-10 justify-center'>
          {liveDataSensors.filter(d => d.groupName === group).map(d => (
            <SensorCard key={d.id} data={d} />
          ))}
        </div>
    </div>
  )

  return (
    <div className='w-full h-auto'>
      <div className='flex flex-col justify-center px-20 mt-10'>
        <div className='flex flex-col bg-gray-800 rounded-xl my-10'>
            
    <div className='flex items-center justify-end pr-20 pt-5'>
        {!groupMode && (
          <button
            className='text-xl px-3 py-2 text-gray-300 bg-cyan-700 rounded-xl hover:bg-cyan-600 cursor-pointer font-bold'
            onClick={() => setGroupMode(true)}
          >
            Grupuj
          </button>
        )}

        {groupMode && 
          <div>
            <p className='text-left text-gray-300 text-xl mb-1'>Wybierz karty</p>
            <input type="text" 
                    value={groupName}
                    onChange={(e)=>setGroupName(e.target.value)}
                    className='block bg-gray-400 mb-3 rounded-sm h-10 px-2'
                    placeholder='Podaj nazwę grupy'/>
            <button
              className={`mx-2 text-xl text-gray-300  px-5 py-2 rounded-xl  font-bold
                          ${selectedSensors.length === 0 || groupName==="" ? "pointer-events-none bg-gray-500":"cursor-pointer bg-cyan-700 hover:bg-cyan-600"}`}
              onClick={confirmGroup}
            >
              Ok
            </button>
            <button
              className='mx-2 text-xl text-gray-300 bg-cyan-700 px-5 py-2 rounded-xl hover:bg-cyan-600 font-bold cursor-pointer'
              onClick={cancelGroup}
            >
              Anuluj
            </button>
          </div>
        }
      </div>
  

          {groups.map(group => (
            <SensorGroup key={group} group={group} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LiveView
