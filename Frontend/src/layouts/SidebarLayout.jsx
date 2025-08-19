import React, { useRef, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { Outlet } from 'react-router-dom'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'



const SidebarLayout = () => {

  const sidebarLinks = [
    { linkText: "Podgląd na żywo", path: "./live-view", icon: assets.liveIcon },
    { linkText: "Wykresy", path: "./dashboards", icon: assets.chartIcon },
    { linkText: "Konfiguracja urządzeń", path: "./device-conf", icon: assets.settingsIcon },
  ]
  // Pomiar width sidebara do animacji
  const ref = useRef(null);
  const [width, setWidth] = useState(null);

  useEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
    }
  }, []);
  if (width === null) return <div ref={ref} className='w-20 lg:w-60'></div>;


  return (
    <div className='flex mt-30 w-full min-h-screen'>
      {/* sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -width + 50 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}

        className='w-20 lg:w-60 h-auto bg-gray-800 fixed bottom-0 top-30 min-h-svh'>
        <div className='flex flex-col'>
          {sidebarLinks.map((link, linkID) => (
            <NavLink key={linkID} to={link.path} className={({ isActive }) =>
              isActive ? "sidebar-link sidebar-link-active" : "sidebar-link"}><span className='hidden lg:block'>{link.linkText}</span><span className='block lg:hidden'><img className='h-10 mx-auto' src={link.icon} alt="" /></span></NavLink>
          ))}
        </div>
      </motion.div>

      {/* content */}
      <motion.div
        initial={{ opacity: 0 }}
        transition={{ duration: 1 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className='w-full overflow-hidden flex-1 ml-20 lg:ml-60 min-h-screen'>

        <Outlet />
      </motion.div >

    </div>
  )
}

export default SidebarLayout