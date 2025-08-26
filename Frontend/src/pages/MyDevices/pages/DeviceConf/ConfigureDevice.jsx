import React from 'react'
import { useParams } from 'react-router-dom'

const ConfigureDevice = () => {
    const { deviceId } = useParams()

    return (
        <div>ConfigureDevice</div>
    )
}

export default ConfigureDevice