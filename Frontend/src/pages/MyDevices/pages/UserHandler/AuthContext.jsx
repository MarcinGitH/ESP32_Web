import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const token = localStorage.getItem("accessToken")
                if (token) {
                    const config = {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }
                    const response = await axios.get("http://127.0.0.1:8000/api/user", config)
                    console.log(response)
                    setLoggedIn(true)
                    setUsername(response.data.username)
                }
                else {
                    setLoggedIn(false)
                    setUsername("")
                }
            }
            catch (error) {
                setLoggedIn(false)
                setUsername("")
            }
        }

        checkLoggedIn()
    }, []);

    return (
        <AuthContext.Provider value={{ loggedIn, setLoggedIn, username, setUsername }}>
            {children}
        </AuthContext.Provider>
    );
};