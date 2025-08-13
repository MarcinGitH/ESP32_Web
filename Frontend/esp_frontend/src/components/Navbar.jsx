import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'



const Navbar = () => {


    return (
        <div className='w-full h-30 px-15 2lg:px-30 flex justify-center'>
            <div className='w-300 h-full flex items-center justify-between border-b-2 border-cyan-400 shadow-[0px_40px_53px_-20px_rgba(38,198,218,_0.1)]'>
                <NavLink to={"/"}><img src={assets.logo} alt="Logo firmy ESP32" className="h-30 w-auto invert" /></NavLink>
                <div className='hidden lg:block px-8 py-2 border-2 border-cyan-400 rounded-full shadow-2xl shadow-cyan-400 '>
                    <ul className='flex gap-8 items-center'>
                        <NavLink to={"/"}><li className='nav-link'>O projekcie</li></NavLink>
                        <NavLink to={"/how-to-start"}><li className='nav-link'>Jak zacząć</li></NavLink>
                        <NavLink to={"/about-us"}><li className='nav-link'> Moje urządzenia</li></NavLink>
                        {/* <NavLink to={"/contact"}><li className='nav-link'>Kontakt</li></NavLink> */}
                    </ul>
                </div>
                <div>
                    <ul className='hidden lg:flex gap-5 items-center'>
                        <NavLink to={"/login"}><li className='login-button bg-gray-200 hover:bg-black'>Zaloguj się</li></NavLink>
                        <NavLink to={"/register"}><li className='login-button'>Zarejestruj się</li></NavLink>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Navbar