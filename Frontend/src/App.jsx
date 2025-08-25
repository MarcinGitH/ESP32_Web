

import { Navigate, Route, Routes } from 'react-router-dom'
import { assets } from './assets/assets'
import AboutProject from './pages/AboutProject/AboutProject'
import MainLayout from './layouts/MainLayout'
import SidebarLayout from './layouts/SidebarLayout'
import HowToStart from './pages/HowToStart/HowToStart'
import Download from './pages/Download/Download'
import LiveView from './pages/MyDevices/pages/LiveView/LiveView'
import Dashboard from './pages/MyDevices/pages/Dashboard/Dashboard'
import DeviceConf from './pages/MyDevices/pages/DeviceConf/DeviceConf'
import DetailsCard2 from './pages/MyDevices/pages/LiveView/DetailsCard2'


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
                    <Route path='my-devices' element={<SidebarLayout />}>
                        <Route index element={<Navigate to="live-view" replace />} />
                        <Route path='live-view' element={<LiveView />} />
                        <Route path='dashboards' element={<Dashboard />} />
                        <Route path='device-conf' element={<DeviceConf />} />
                    </Route>
                    <Route path='download' element={<Download />} />
                </Route>
                <Route path='/details-card/:sensorId' element={<DetailsCard2 />} />
            </Routes>

        </div>
    )
}

export default App