import React from 'react'
import EasyConfigImg from "./assets/images/EasyConfig.png"
import ChartsImg from "./assets/images/Charts.jpg"
import { motion } from "framer-motion"

const AboutProject = () => {
    return (
        <div>
            <div className='mx-5 sm:mx-0 mt-10 lg:mt-30 flex flex-col'>
                {/* Szybka konfiguracja */}
                <motion.div
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ duration: 2 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className='flex flex-col items-center gap-20 lg:flex-row lg:gap-50 2xl:gap-80 justify-center container mx-auto border-b-5 py-20 lg:py-60 border-b-cyan-100'>
                    <div className='bg-black rounded-3xl p-5'>
                        <h2 className='text-gray-100 font-medium text-2xl sm:text-4xl mb-4'>Łatwa konfiguracja</h2>
                        <ul className='flex flex-col gap-2 ml-20'>
                            <li className='text-gray-300 text-xl sm:text-2xl li-dot-pointer'>Konfiguruj ESP za pomocą graficznego interfejsu</li>
                            <li className='text-gray-300 text-xl sm:text-2xl li-dot-pointer'>Po prostu wybierz pin i funkcję</li>
                            <li className='text-gray-300 text-xl sm:text-2xl li-dot-pointer'>Odbieraj dane z wielu urządzeń w jednym miejscu</li>
                        </ul>
                    </div>
                    <div className='max-w-xs'>
                        <img src={EasyConfigImg} alt="" className='w-full' />
                    </div>
                </motion.div>

                {/* Wykresy i dane historyczne */}
                <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    transition={{ duration: 2 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className='flex flex-col justify-center lg:flex-row lg:gap-50 2xl:gap-80 items-center container mx-auto py-20 lg:py-60 border-b-5 border-b-cyan-100'>
                    <div className='max-w-xs order-2 lg:order-1'>
                        <img src={ChartsImg} alt="" className='w-full' />
                    </div>
                    <div className='bg-black rounded-3xl p-5 mb-20 lg:mb-0 order-1 lg:order-2'>
                        <h2 className='text-gray-100 font-medium text-2xl sm:text-4xl mb-4'>Wykresy i dane</h2>
                        <ul className='flex flex-col gap-2 ml-20'>
                            <li className='text-gray-300 text-xl sm:text-2xl li-dot-pointer'>Przeglądaj dane historyczne</li>
                            <li className='text-gray-300 text-xl sm:text-2xl li-dot-pointer'>Analizuj wykresy</li>
                        </ul>
                    </div>
                </motion.div>

                {/* Dane w czasie rzeczywistym */}
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    transition={{ duration: 2 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className='flex flex-col items-center gap-20 lg:flex-row lg:gap-50 2xl:gap-80 justify-center containe  mx-auto py-20 lg:py-60'>
                    <div className='bg-black rounded-3xl p-5'>
                        <h2 className='text-gray-100 font-medium text-2xl sm:text-4xl mb-4'>Sterowanie live</h2>
                        <ul className='flex flex-col gap-2 ml-20'>
                            <li className='text-gray-300 text-xl sm:text-2xl li-dot-pointer'>Włączaj i wyłączaj wyjścia</li>
                            <li className='text-gray-300 text-xl sm:text-2xl li-dot-pointer'>Obserwuj dane live</li>
                        </ul>
                    </div>
                    <div className='max-w-xs'>
                        <img src={EasyConfigImg} alt="" className='w-full' />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default AboutProject