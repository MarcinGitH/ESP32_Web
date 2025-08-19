import React from 'react'
import { liveDataSensors } from '../../../assets/assets'

const LiveView = () => {



  return (
    <div className='w-full h-auto'>
      <div className='flex flex-col justify-center px-20 mt-10'>
        {/* Sensors */}
        <div className='bg-gray-800 rounded-xl my-10'>
          <div className='mx-20 mt-5 relative text-center'>
            <button className='absolute right-0 top-0 text-xl text-gray-300 bg-cyan-700 px-10 py-3 rounded-xl hover:bg-cyan-600 cursor-pointer font-bold'>Grupuj</button>
            <h2 className='text-gray-300 text-center text-3xl font-bold mb-10'>Dane z czujników</h2>
            <div className='flex flex-wrap pb-10 gap-10 justify-center'>
              {liveDataSensors.map((data, id) => (
                <div className='flex flex-col justify-start w-70 py-2 bg-gray-600 rounded-xl cursor-pointer transition-all hover:-translate-y-2 hover:bg-gray-500'>
                  <span className='text-gray-300 text-center block mt-2 px-4 font-bold text-xl'>{data.name}</span>
                  <span className='block text-center text-gray-400 mt-20 font-[Orbitron] text-6xl'>{data.value}</span>
                  <span className={`block text-center text-gray-400 mt-20 text-3xl ${data.online ? "text-green-600" : "text-red-800"}`}>{data.online ? "Online" : "Offline"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* On/Off */}
        <div>

        </div>

      </div>
    </div>
  )
}

export default LiveView