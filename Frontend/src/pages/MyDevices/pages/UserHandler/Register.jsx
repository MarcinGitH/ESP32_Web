import React, { useContext, useState } from 'react'
import axios from 'axios'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import api from '../../../../components/api.js'

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password1: "",
        password2: "",
    })

    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { setLoggedIn, setUsername } = useContext(AuthContext);
    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const login = async () => {

        try {
            const response = await toast.promise(
                api.post('/auth/login', { email: formData.email, password: formData.password1 }),
                {
                    pending: {
                        render: 'Łączenie z serwerem...',
                        className: 'toast-background',
                    },
                    error: {
                        className: 'toast-background',
                        render({ data }) {
                            if (data?.response?.data) {
                                const errors = Object.values(data.response.data).flat();
                                return (
                                    <div>
                                        {errors.map((msg, idx) => (
                                            <div key={idx}>{msg}</div>
                                        ))}
                                    </div>
                                );
                            }
                            return "Błąd zapisu (brak odpowiedzi serwera)";
                        },
                    },
                }
            );


            sessionStorage.setItem("accessToken", response.data.tokens.access);
            sessionStorage.setItem("refreshToken", response.data.tokens.refresh);
            sessionStorage.setItem("justLoggedIn", "true");
            setLoggedIn(true)
            setUsername(response.data.username)
            navigate("../my-devices")
        } catch (error) {
            console.log("Błąd przy logowaniu")
        }
    }

    const handleSubmit = async (e) => {

        e.preventDefault()
        if (isLoading) {
            return
        }
        setIsLoading(true)

        try {
            await toast.promise(
                api.post('/auth/register', formData),
                {
                    pending: {
                        render: 'Łączenie z serwerem...',
                        className: 'toast-background',
                    },
                    success: {
                        render: 'Konto zostało utworzone',
                        className: 'toast-background',
                    },
                    error: {
                        render({ data }) {
                            if (data.response) {
                                const errors = Object.values(data.response.data);
                                return (
                                    <div>
                                        {errors.map((msg, idx) => (
                                            <div key={idx}>{msg}</div>
                                        ))}
                                    </div>
                                );
                            }
                            return "Błąd zapisu (brak odpowiedzi serwera)";
                        },
                    }
                }
            )
            login()
        }
        catch (error) {
            console.log("Błąd przy rejestracji", error.response?.data)
        }

        finally {
            setIsLoading(false)
        }

    }

    return (
        <div className='flex mt-40 w-full min-h-screen text-gray-300'>
            <ToastContainer
                position="top-right"
                autoClose={6000}
                theme="dark"
                pauseOnFocusLoss={false}
                pauseOnHover={false}
                transition={Bounce}
            />
            <motion.div
                className='mx-auto w-110 h-110 bg-gray-700 rounded-3xl'
                initial={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                animate={{ opacity: 1 }}
                viewport={{ once: true }}
            >

                <form className='px-10 flex flex-col justify-center gap-5'>
                    <h2 className=' text-center pt-5 text-3xl'>Rejestracja</h2>
                    <div className='flex flex-col w-70 gap-1 mx-auto'>
                        <p>Nazwa użytkownika:</p>
                        <input type="text" name='username' onChange={handleChange} value={formData.username} className='bg-gray-600 px-2 py-1 rounded-md' />
                        <p>Email:</p>
                        <input type="email" name='email' onChange={handleChange} value={formData.email} className='bg-gray-600 px-2 py-1 rounded-md' />
                        <p>Hasło:</p>
                        <input type="password" name='password1' onChange={handleChange} value={formData.password1} className='bg-gray-600 px-2 py-1 rounded-md' />
                        <p>Powtórz hasło:</p>
                        <input type="password" name='password2' onChange={handleChange} value={formData.password2} className='bg-gray-600 px-2 py-1 rounded-md' />
                    </div>

                    {/* <br /> */}
                    <button type="submit" disabled={isLoading} onClick={handleSubmit} className='mx-auto button disabled:bg-gray-500 disabled:pointer-events-none'>Zarejestruj się</button>
                </form>

            </motion.div>
        </div>

    )
}

export default Register