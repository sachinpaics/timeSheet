import { CheckOutlined, CloseOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined, SecurityScanOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons'
import { Button, Divider, Form, Input, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { host } from '..'
import httpClient from '../httpClient'
import { encode as base64_encode } from 'base-64';

const RegisterPage: React.FC = () => {


    const [password, setPassword] = useState({
        password: ''
    })
    const [validLength, setValidLength] = useState(false);
    const [hasNumber, setHasNumber] = useState(false);
    const [upperCase, setUpperCase] = useState(false);
    const [lowerCase, setLowerCase] = useState(false);
    const [specialChar, setSpecialChar] = useState(false);
    const [requiredLength] = useState(8)

    const inputChange: (event: React.ChangeEvent<HTMLInputElement>) => void = (event) => {
        const { value, name } = event.target;
        setPassword({
            ...password,
            [name]: value
        })
    }

    useEffect(() => {
        setValidLength(password.password.length >= requiredLength ? true : false);
        setUpperCase(password.password.toLowerCase() !== password.password);
        setLowerCase(password.password.toUpperCase() !== password.password);
        setHasNumber(/\d/.test(password.password));
        setSpecialChar(/[ `!@#$%^&*()_+\-=\]{};':"\\|,.<>?~]/.test(password.password));

    }, [password, requiredLength]);

    const [email, setEmail] = useState<string>("")
    const [first_name, setFirstName] = useState<string>("")
    const [last_name, setLastname] = useState<string>("")

    let checkPass = () => {
        if (
            hasNumber &&
            upperCase &&
            lowerCase &&
            requiredLength >= 8 &&
            specialChar &&
            email !== '' &&
            first_name !== '' &&
            last_name !== ''
        ) {
            return true
        }
        else {
            return false
        }
    }

    const registerUser = async () => {
        try {
            const encodedPass = base64_encode(password['password'])
            const data = {
                "email": email,
                "password": encodedPass,
                "first_name": first_name,
                "last_name": last_name
            }
            if (checkPass()) {
                try {
                    await httpClient.post("//" + host + "/register", data)

                    window.location.href = "/"

                }

                catch (error: any) {
                    if (error.response.status === 401) {
                        alert("Invalid Credentials")
                    }
                    else if (error.response.status === 409) {
                        alert("This user already exists")
                    }
                }
            } else {
                alert('Please make sure you fill all the fields and choose a strong password.')
            }
        }
        catch (error: any) {
            console.log("Something went wrong.")
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "100px", width: "500px", marginLeft: "450px" }}>
            <div >
                <h1>Create a new account</h1>
                <Form>
                    <Input size="small" placeholder="First Name" value={first_name} onChange={(e) => setFirstName(e.target.value)} prefix={<UserAddOutlined />} />
                    <Divider type="vertical" />
                    <Input size="small" placeholder="Last Name" value={last_name} onChange={(e) => setLastname(e.target.value)} prefix={<UserOutlined></UserOutlined>} />
                    <Divider type="vertical" />
                    <Input size="small" placeholder="input email" value={email} onChange={(e) => setEmail(e.target.value)} prefix={<MailOutlined />} />
                    <div>
                        <br />
                        <Input.Password
                            name='password'
                            placeholder="input password"
                            prefix={<SecurityScanOutlined />}
                            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            onChange={inputChange}
                        />
                        <ul>
                            <li>
                                Valid Length: {validLength ? <Typography.Text mark><CheckOutlined /></Typography.Text> : <Typography.Text mark><CloseOutlined /></Typography.Text>}
                            </li>
                            <li>
                                Has a Number: {hasNumber ? <Typography.Text mark><CheckOutlined /></Typography.Text> : <Typography.Text mark><CloseOutlined /></Typography.Text>}
                            </li>
                            <li>
                                UpperCase: {upperCase ? <Typography.Text mark><CheckOutlined /></Typography.Text> : <Typography.Text mark><CloseOutlined /></Typography.Text>}
                            </li>
                            <li>
                                LowerCase: {lowerCase ? <Typography.Text mark><CheckOutlined /></Typography.Text> : <Typography.Text mark><CloseOutlined /></Typography.Text>}
                            </li>
                            <li>
                                Special Character: {specialChar ? <Typography.Text mark><CheckOutlined /></Typography.Text> : <Typography.Text mark><CloseOutlined /></Typography.Text>}
                            </li>
                        </ul>
                    </div>
                    <Button type="primary" shape="round" onClick={() => registerUser()}>Submit</Button>
                </Form>
            </div>
        </div>
    )
}

export default RegisterPage