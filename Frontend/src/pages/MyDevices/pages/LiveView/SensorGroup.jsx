import React from 'react';
import SensorCard from './SensorCard';
import { liveDataSensors } from '../../../../assets/assets';

const SensorGroup = ({ group, selectedSensors, groupMode, groupToggleSensor, liveDetailsId, setLiveDetailsId }) => (
  <div>
    <h2 className='text-gray-300 text-3xl font-bold my-10 w-full text-center bg-gray-700 rounded-md'>{group}</h2>
    <div className='flex flex-wrap pb-10 px-10 gap-10 justify-center'>
      {liveDataSensors.filter(d => d.groupName === group).map(d => (
        <SensorCard
          key={d.id}
          data={d}
          selectedSensors={selectedSensors}
          groupMode={groupMode}
          groupToggleSensor={groupToggleSensor}
          liveDetailsId={liveDetailsId}
          setLiveDetailsId={setLiveDetailsId}
        />
      ))}
    </div>
  </div>
);

export default SensorGroup;
