/**
 * @author Sachin Pai
 * @email sachin.pai@atmecs.com
 * @create date 2022-09-09 18:26:24
 * @modify date 2022-09-13 19:01:24
 * @desc This is the landing page of the project, the user can follow the flow from this page.
 */

import { LoginOutlined } from '@ant-design/icons'
import { Button, Divider, Form } from 'antd'
import React, { useEffect, useState } from 'react'
import { host, Title } from '..'
import httpClient from '../httpClient'
import { User } from '../types'

const LandingPage = () => {
    const [user, setUser] = useState<User | null>(null)

    const logOutUser = async () => {
        await httpClient.post("//" + host + "/logout")
        window.location.href = "/"
    }

    const attendance = async () => {
        window.location.href = "/timesheet"
    }

    useEffect(() => {

        (async () => {
            try {
                const resp = await httpClient.get("//" + host + "/@me")

                setUser(resp.data)
            }

            catch (error: any) {
                console.log("Not authenticated")
            }
        })()
    }, [])
    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    return (
        <div style={{ textAlign: "center", padding: "40px" }}>
            {user != null ? (
                <div>
                    <Title level={2}> Welcome to the timesheet portal, {capitalize(user.email.split('.')[0])}</Title>

                    <h1>You have logged in succesfully</h1>

                    <h2>Name: {user.name + ' ' + user.last_name}</h2>
                    <h2>Username: {user.email}</h2>

                    <Divider type="vertical" />

                    <Button size="large" type="primary" shape="round" onClick={() => attendance()}>
                        Timesheet
                    </Button>

                    <Divider type="vertical" />

                    <Button size='small' danger type="primary" onClick={() => logOutUser()} icon={<LoginOutlined />}>
                        Log out
                    </Button>
                </div>

            ) : (
                <div style={{ textAlign: "center", padding: "200px" }}>
                    <Form>
                        <Divider type="vertical" />
                        <Title level={2}>Kindly log in to get access to timesheet</Title>
                        <Divider type="vertical" />
                        <a href="/login" ><Button type="primary" shape="round" icon={<LoginOutlined />}>Login</Button></a>
                        <Divider type="vertical" />
                        <a href="/register"><Button type="primary" shape="round">Register</Button></a>
                    </Form>
                </div>
            )}
        </div>
    )

}
export default LandingPage