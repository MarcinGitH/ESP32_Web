import { AuthContext } from '../UserHandler/AuthContext';
import React, { useContext, useEffect, useState, useRef } from 'react';
import api from '../../../../components/api.js'
import { useNavigate } from 'react-router-dom';

const useAuth = () => {
    const { loggedIn, username, setLoggedIn, setUsername } = useContext(AuthContext);
    const navigate = useNavigate()

    const checkLoggedIn = async () => {
      try {
        
          const response = await api.get("/auth/user")
          setLoggedIn(true)
          setUsername(response.data.username)
        }
      catch (error) {
        setLoggedIn(false)
        setUsername("")
        if (error.response?.status === 401) {
          navigate("/login")
        }
      }
    }

    useEffect(()=>{
        checkLoggedIn()
    },[])
}

export default useAuth