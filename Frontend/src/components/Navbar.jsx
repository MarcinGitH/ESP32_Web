import React, { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { div, li } from 'framer-motion/client'
import axios from 'axios'
import { useContext } from "react";
import { AuthContext } from '../pages/MyDevices/pages/UserHandler/AuthContext'



const Navbar = () => {

    const navbarLinks = [
        { linkText: "O projekcie", path: "/" },
        { linkText: "Jak zacząć", path: "/how-to-start" },
        { linkText: "Moje urządzenia", path: "/my-devices" },
        // { linkText: "Pobierz", path: "/download" },
    ];

    const [menuBarShow, setMenuBarShow] = useState(false)
    const { loggedIn, username, setLoggedIn, setUsername } = useContext(AuthContext);
    const navigate = useNavigate()



    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken")
            if (refreshToken) {
                await axios.post("http://127.0.0.1:8000/api/logout", { "refresh": refreshToken })
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                setLoggedIn(false)
                setUsername("")
                navigate("/")
            }
        }
        catch (error) {
            if(error.code === "ERR_NETWORK"){
                localStorage.removeItem("accessToken")
                localStorage.removeItem("refreshToken")
                setLoggedIn(false)
                setUsername("")
                navigate("/")
            }
            else{
                console.log("Nieprawidłowe wylogowanie")
            }
            
            
        }
    }

    return (
        <div>
            <div className='w-full h-30 px-5 sm:px-15 2lg:px-30 flex justify-center fixed top-0 z-50 bg-gray-950'>
                <div className='w-300 h-full flex items-center justify-between border-b-2 border-cyan-400 shadow-[0px_40px_53px_-20px_rgba(38,198,218,_0.1)]'>
                    <NavLink to={"/"}><img src={assets.logo} alt="Logo firmy ESP32" className="h-30 w-auto invert" /></NavLink>
                    <div className='hidden lg:block px-8 py-2 border-2 bg-black border-cyan-400 rounded-full shadow-2xl shadow-cyan-400 '>
                        <ul className='flex gap-8 items-center'>
                            {navbarLinks.map((link, linkID) => (
                                <li key={linkID}><NavLink to={link.path} className={({ isActive }) =>
                                    isActive ? "nav-link nav-link-active" : "nav-link"}>{link.linkText}</NavLink></li>
                            ))}
                        </ul>
                    </div>
                    {loggedIn
                        ?
                        <div className='hidden lg:block'>
                            <span className='text-gray-300 text-xl'>{username}</span>
                            <button type="button" className='login-button cursor-pointer ml-5' onClick={handleLogout} >Wyloguj</button>
                        </div>
                        :
                        <div className='hidden lg:block'>
                            <ul className='flex gap-5 items-center'>
                                <NavLink to={"/login"}><li className='login-button bg-gray-200 hover:bg-black'>Zaloguj się</li></NavLink>
                                <NavLink to={"/register"}><li className='login-button'>Zarejestruj się</li></NavLink>
                            </ul>
                        </div>
                    }

                    <img className='lg:hidden h-1/2 cursor-pointer' onClick={() => setMenuBarShow(!menuBarShow)} src={assets.menuBar} alt="" />
                </div>
            </div>

            {/* Menu mobilne */}
            <div className={`bg-gray-600 z-30 top-30 bottom-0 right-0 overflow-hidden transition-all  ${menuBarShow ? "fixed w-full h-screen opacity-100" : "fixed w-0 h-0 opacity-0"}`}>
                <ul className='flex pt-10 items-center gap-5 justify-between flex-col'>
                    {navbarLinks.map((link, linkID) => (
                        <li key={linkID} className='w-1/2 text-center'><NavLink to={link.path} onClick={() => setMenuBarShow(false)} className={({ isActive }) =>
                            isActive ? "nav-link-mobile nav-link-mobile-active" : "nav-link-mobile"}>{link.linkText}</NavLink></li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Navbar