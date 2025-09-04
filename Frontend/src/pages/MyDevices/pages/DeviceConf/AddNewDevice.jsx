import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../../../../assets/assets'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import api from '../../../../components/api.js'

const AddNewDevice = () => {
    const navigate = useNavigate()
    const [addDeviceToken, setAddDeviceToken] = useState()
    const [timeLeftBarWidth, setTimeLeftBarWidth] = useState(0) // 0 - 100
    const [serverOk, setServerOk] = useState()
    const tokenRef = useRef()
    const [copySuccess, setCopySuccess] = useState(false);

    const copyToClipboard = async () => {
        if ("clipboard" in navigator) {
            await navigator.clipboard.writeText(tokenRef.current.token);
        } else {
            document.execCommand("copy", true, tokenRef.current.token);
        }
        setCopySuccess(true)

        setTimeout(() => {
            setCopySuccess(false)
        }, 1000);
        console.log(copySuccess)
    }

    useEffect(() => {
        tokenRef.current = addDeviceToken
    }, [addDeviceToken])

    useEffect(() => {

        const getToken = async () => {
            if (!tokenRef.current || tokenRef.current.expires_at < Date.now()) {
                try {
                    const res = await api.get("/devices/get-add-device-token")
                    setAddDeviceToken(res.data)
                    setServerOk(true)
                }
                catch(error) {
                    setServerOk(false)
                    if (error.response?.status === 401) {
                        navigate("/login")
                        }
                }
            }
            else {
                setTimeLeftBarWidth((tokenRef.current.expires_at - Date.now()) / (tokenRef.current.expires_at - tokenRef.current.created_at) * 100)
            }

        }

        const interval = setInterval(getToken, 100);

        return () => clearInterval(interval)
    }, [])

    return (
        <div className='px-1 sm:px-20 mt-10 w-full h-auto'>
            <div className='bg-gray-800  px-1 sm:px-20 mt-10 text-center py-10 rounded-xl relative'>
                <img src={assets.xmark} alt=""
                    className='absolute top-5 right-5 w-10 h-10 md:w-15 md:h-15 cursor-pointer'
                    onClick={() => navigate("../device-conf")} />
                <h2 className='text-2xl md:text-3xl mt-10 md:mt-5 text-gray-300'>Token autoryzacji urządzenia</h2>
                <div className='rounded-2xl w-80 md:w-100 inline-block bg-gray-700 mt-5 px-3 relative'>
                    <img src={assets.copy} alt="Kopiuj" className='w-8 absolute right-5 top-1/2 -translate-y-1/2 cursor-pointer z-50'
                        onClick={copyToClipboard}
                        title='Kopiuj' />
                    <div className={`absolute -right-5 -top-4 bg-green-600 px-3 py-1 rounded-2xl text-gray-200 transition-all duration-300 ${copySuccess ? "opacity-100" : "opacity-0"}`}>Skopiowano</div>
                    <div className='w-full h-full py-5 relative'>
                        <p className='text-2xl text-gray-300'>{serverOk ? addDeviceToken.token : "Łączenie z serwerem"}</p>
                        <div className="absolute bg-green-900 bottom-0 left-0 h-2 w-full rounded-full"></div>
                        <div className="absolute bg-green-600 bottom-0 left-0 h-2 rounded-full"
                            style={{ width: `${timeLeftBarWidth}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddNewDevice