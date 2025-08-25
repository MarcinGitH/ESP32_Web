
import React, { useState } from 'react';
import DetailsCard from './DetailsCard';
import SensorGroup from './SensorGroup';
import { liveDataSensors } from '../../../../assets/assets';
import { motion } from 'framer-motion';
import DetailsCard2 from './DetailsCard2';
import { Navigate } from 'react-router-dom';

const LiveView = () => {
  const [groupMode, setGroupMode] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [liveDetailsId, setLiveDetailsId] = useState(-1);

  const groupToggleSensor = (id) => {
    setSelectedSensors(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const cancelGroup = () => {
    setSelectedSensors([]);
    setGroupMode(false);
    setGroupName("");
  };

  const confirmGroup = () => {
    liveDataSensors.forEach(data => {
      if (selectedSensors.includes(data.id)) data.groupName = groupName;
    });
    cancelGroup();
  };

  const groups = [
    ...new Set(liveDataSensors.filter(d => d.groupName !== "Inne").map(d => d.groupName)),
    ...(liveDataSensors.some(d => d.groupName === "Inne") ? ["Inne"] : [])
  ];

  const groupBar = (
    <div className='flex items-center justify-center pt-5 sm:justify-end sm:pr-20'>
      {!groupMode && (
        <button
          className='text-xl px-3 py-2 text-gray-300 bg-cyan-700 rounded-xl hover:bg-cyan-600 cursor-pointer font-bold'
          onClick={() => setGroupMode(true)}
          type='button'
        >
          Grupuj
        </button>
      )}
      {groupMode &&
        <form onSubmit={(e) => {
          e.preventDefault()
          if (selectedSensors.length > 0 && groupName !== "") {
            confirmGroup()
          }
        }}
          className='flex flex-col items-center gap-2 sm:block'>
          <p className='text-left text-gray-300 text-xl mb-1'>Wybierz karty</p>
          <input type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className='block bg-gray-400 text-gray-700 mb-3 rounded-sm w-full h-10 px-2'
            placeholder='Podaj nazwę grupy' />
          <button
            className={`w-15 mx-2 text-xl text-gray-300 py-2 rounded-xl  font-bold
                          ${selectedSensors.length === 0 || groupName === "" ? "pointer-events-none bg-gray-500" : "cursor-pointer bg-cyan-700 hover:bg-cyan-600"}`}
            type='submit'
          >
            Ok
          </button>
          <button
            className='w-25 mx-2 text-xl text-gray-300 bg-cyan-700 py-2 rounded-xl hover:bg-cyan-600 font-bold cursor-pointer'
            onClick={cancelGroup}
            type='button'
          >
            Anuluj
          </button>
        </form>
      }
    </div>
  )

  return (
    <div className='w-full h-auto'>
      <motion.div
        className='flex flex-col justify-center px-1 sm:px-20 mt-10'
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        animate={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {liveDetailsId > -1 ? (
          // <DetailsCard
          //   sensor={liveDataSensors.find(d => d.id === liveDetailsId)}
          //   setLiveDetailsId={setLiveDetailsId}
          //   selectedSensors={selectedSensors}
          //   groupMode={groupMode}
          //   groupToggleSensor={groupToggleSensor}
          // />
          <Navigate to={`../../../details-card/${liveDetailsId}`} />
        ) : (
          <div className='flex flex-col bg-gray-800 rounded-xl my-10 sm:px-10'>
            {groupBar}

            {groups.map(group => (
              <SensorGroup
                key={group}
                group={group}
                selectedSensors={selectedSensors}
                groupMode={groupMode}
                groupToggleSensor={groupToggleSensor}
                liveDetailsId={liveDetailsId}
                setLiveDetailsId={setLiveDetailsId}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LiveView;
