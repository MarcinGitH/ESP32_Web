

import { Navigate, Route, Routes } from 'react-router-dom'
import { assets } from './assets/assets'
import AboutProject from './pages/AboutProject/AboutProject'
import MainLayout from './layouts/MainLayout'
import SidebarLayout from './layouts/SidebarLayout'
import HowToStart from './pages/HowToStart/HowToStart'
import Download from './pages/Download/Download'
import Dashboard from './pages/MyDevices/pages/Dashboard'
import LiveView from './pages/MyDevices/pages/LiveView'
import DeviceConf from './pages/MyDevices/pages/DeviceConf'


const App = () => {
    return (
        <div >
            {/* Background */}
            <div
                className="fixed inset-0 -z-10  bg-cover bg-center h-screen"
                style={{ backgroundImage: `url(${assets.background_start})` }}>
            </div>

            <Routes>
                <Route path='/' element={<MainLayout />}>
                    <Route index element={<AboutProject />} />
                    <Route path='how-to-start' element={<HowToStart />} />
                    <Route path='my-devices' element={<SidebarLayout/>}>
                        <Route index element={<Navigate to="live-view" replace />}/>
                        <Route path='live-view' element={<LiveView/>} />
                        <Route path='dashboards' element={<Dashboard/>} />
                        <Route path='device-conf' element={<DeviceConf/>} />
                    </Route>
                    <Route path='download' element={<Download />} />
                </Route>
            </Routes>

        </div>
    )
}

export default App