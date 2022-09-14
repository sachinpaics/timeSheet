import { EyeInvisibleOutlined, EyeTwoTone, SecurityScanOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input } from 'antd'
import React, { useState } from 'react'
import { host } from '..'
import httpClient from '../httpClient'
import { encode as base64_encode } from 'base-64';

const LoginPage: React.FC = () => {

    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const logInUser = async () => {
        const encodedPass = base64_encode(password)
        const data = {
            "email": email,
            "password": encodedPass
        }
        try {
            await httpClient.post("//" + host + "/login", data)
            window.location.href = "/"

        }
        catch (error: any) {
            if (error.response.status === 401) {
                alert("Invalid Credentials")
            }
        }

    };

    return (
        <div style={{ textAlign: "center", padding: "100px", width: "500px", marginLeft: "450px" }}>
            <h1>Log into your account</h1>
            <Form >
                <Input size="small" placeholder="input email" onChange={(e) => setEmail(e.target.value)} prefix={<UserOutlined></UserOutlined>} />
                <Divider type="vertical" />
                <Input.Password
                    placeholder="input password"
                    prefix={<SecurityScanOutlined />}
                    iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <Divider type="vertical" />
                <br />
                <Button size='large' type="primary" shape="round" onClick={() => logInUser()}>Submit</Button>
            </Form>
        </div>
    )
}

export default LoginPage