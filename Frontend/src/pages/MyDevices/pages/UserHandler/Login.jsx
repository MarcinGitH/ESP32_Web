
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { motion } from 'framer-motion';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    })

    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const { setLoggedIn, setUsername } = useContext(AuthContext);


    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await toast.promise(
                axios.post('http://127.0.0.1:8000/api/login', formData),
                {
                    pending: {
                        render: 'Łączenie z serwerem...',
                        className: 'toast-background',
                    },
                    success: {
                        render: 'Zalogowano pomyślnie',
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


            localStorage.setItem("accessToken", response.data.tokens.access);
            localStorage.setItem("refreshToken", response.data.tokens.refresh);
            localStorage.setItem("justLoggedIn", "true");
            setLoggedIn(true)
            setUsername(response.data.username)
            navigate("../my-devices")
        } catch (error) {
            console.log("Błąd przy logowaniu")
        } finally {
            setIsLoading(false);
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
                className='mx-auto w-110 h-80 bg-gray-700 rounded-3xl'
                initial={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                animate={{ opacity: 1 }}
                viewport={{ once: true }}
            >

                <form className='px-10 flex flex-col justify-center gap-5'>
                    <h2 className=' text-center pt-5 text-3xl'>Logowanie</h2>
                    <div className='flex flex-col w-70 gap-1 mx-auto'>
                        <p>Email:</p>
                        <input type="email" name='email' onChange={handleChange} value={formData.email} className='bg-gray-600 px-2 py-1 rounded-md' />
                        <p>Hasło:</p>
                        <input type="password" name='password' onChange={handleChange} value={formData.password} className='bg-gray-600 px-2 py-1 rounded-md' />
                    </div>

                    {/* <br /> */}
                    <button type="submit" disabled={isLoading} onClick={handleSubmit} className='mx-auto button disabled:bg-gray-500 disabled:pointer-events-none'>Zaloguj</button>
                </form>

            </motion.div>
        </div>
    )
}

export default Login