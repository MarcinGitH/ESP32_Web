

import { Route, Routes } from 'react-router-dom'
import { assets } from './assets/assets'
import AboutProject from './pages/AboutProject/AboutProject'
import Navbar from './components/Navbar'
import MainLayout from './layouts/MainLayout'
import HowToStart from './pages/HowToStart/HowToStart'
import MyDevices from './pages/MyDevices/MyDevices'
import Download from './pages/Download/Download'

const App = () => {
    return (
        <div >
            {/* Background */}
            <div
                className="fixed inset-0 -z-10 
               bg-cover bg-center"
                style={{ backgroundImage: `url(${assets.background_start})` }}>
            </div>

            <Routes>
                <Route path='/' element={<MainLayout />}>
                    <Route index element={<AboutProject />} />
                    <Route path='how-to-start' element={<HowToStart />} />
                    <Route path='my-devices' element={<MyDevices />} />
                    <Route path='download' element={<Download />} />
                </Route>
            </Routes>

        </div>
    )
}

export default App