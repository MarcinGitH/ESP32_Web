import React from 'react';

const SensorCard2 = ({ sensorData, hoverEffect, selected }) => {
  const handleClick = () => {
    if (groupMode) groupToggleSensor(sensorData.id);
    else setLiveDetailsId(sensorData.id);
  };

  const selectedClasses = selected
    ? "sm:-translate-y-2 bg-gray-500 border-2 border-gray-300"
    : "bg-gray-600";

  const hoverClasses = hoverEffect ? "sm:hover:-translate-y-2 hover:bg-gray-500 cursor-pointer" : "";

  return (
    <div
      className={`flex flex-col justify-start w-[280px] py-2 rounded-xl transition-all ${selectedClasses} ${hoverClasses}`}
      onClick={handleClick}
    >
      <span className='text-gray-300 text-center block mt-2 px-2 sm:px-4 font-bold text-md sm:text-xl'>{sensorData.name}</span>
      <span className='block text-center text-gray-300 mt-6 sm:mt-20 font-["Tourney"] text-6xl sm:text-8xl'>{sensorData.online ? sensorData.value : "--"}</span>
      <span className={`block text-center text-gray-400 mt-6 sm:mt-20 text-2xl sm:text-3xl ${sensorData.online ? "text-green-600" : "text-gray-200"}`}>
        {sensorData.online ? "Online" : "Offline"}
      </span>
    </div>
  );
};

export default SensorCard2;
