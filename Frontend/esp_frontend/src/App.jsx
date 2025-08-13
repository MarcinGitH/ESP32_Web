

import { Route, Routes } from 'react-router-dom'
import { assets } from './assets/assets'
import AboutProject from './pages/AboutProject'
import Navbar from './components/Navbar'

const App = () => {
    return (
        <div >
            {/* Background */}

            <div style={{ backgroundImage: `url(${assets.background_start})` }}
                className="bg-cover bg-center bg-no-repeat w-full h-screen">

                <Navbar />
                <Routes>
                    <   Route path='/' element={<AboutProject />} />
                </Routes>
            </div>
        </div>
    )
}

export default App