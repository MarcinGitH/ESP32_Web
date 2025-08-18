

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

            <div style={{ backgroundImage: `url(${assets.background_start})` }}
                className="bg-cover bg-center bg-no-repeat bg-fixed w-full min-h-screen">


                <Routes>
                    <Route path='/' element={<MainLayout />}>
                        <Route index element={<AboutProject />} />
                        <Route path='how-to-start' element={<HowToStart />} />
                        <Route path='my-devices' element={<MyDevices />} />
                        <Route path='download' element={<Download />} />
                    </Route>
                </Routes>
            </div>
        </div>
    )
}

export default App