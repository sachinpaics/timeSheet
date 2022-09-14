import React, { useEffect, useState } from 'react'
import 'antd/dist/antd.min.css'
import httpClient from '../httpClient';
import { Button, Divider, Form, Table } from 'antd';
import { User } from '../types';
import { host, Title } from '..';
import { BackwardFilled, LoginOutlined } from '@ant-design/icons';

type TablePaginationPosition = 'bottomCenter'

const App = () => {
    const [tableData, setTableData] = useState([])
    const [user, setUser] = useState<User | null>(null)
    const [form] = Form.useForm();
    const bottomCenter: TablePaginationPosition = ('bottomCenter');

    const logOutUser = async () => {
        await httpClient.post("//" + host + "/logout")
        window.location.href = "/"
    }

    useEffect(() => {

        (async () => {
            try {
                const resp = await httpClient.get("//" + host + "/@me")
                setUser(resp.data)
            }

            catch (error: any) {
                console.log("Not authenticated")
                window.location.href = "/"
            }
        })()

        const getJson = async () => {
            await httpClient.get('http://' + host + '/getAttendance')
                .then(function (response) {
                    setTableData(response.data);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        getJson();
    }, []);
    const columns = [
        {
            title: 'DATE',
            dataIndex: 'date',
            key: 'date'
        },
        {
            title: 'DAY',
            dataIndex: 'day',
            key: 'day'
        },
        {
            title: 'PUNCH IN',
            dataIndex: 'punch_in',
            key: 'punch_in'
        },

        {
            title: 'PUNCH OUT',
            dataIndex: 'punch_out',
            key: 'punch_out',
        },
        {
            title: 'DURATION',
            dataIndex: 'duration',
            key: 'duration',
        }]

    let total = 0
    if (tableData.length !== 0) {
        total = tableData.length / 7
    }
    const backToTimesheetEdit = async () => {
        window.location.href = "/timesheet"
    }

    return (
        <div style={{ textAlign: "center" }}>
            {user != null ? (
                <Title level={2}>Old Records</Title>
            ) : (
                <div>
                    Are you logged in?
                </div>
            )}
            {total !== 0 ? (
                <Form form={form}>
                    <Table
                        bordered
                        rowKey="id"
                        dataSource={tableData}
                        columns={columns}
                        pagination={{ pageSize: 7, defaultCurrent: total, position: [bottomCenter] }}

                    />
                    <Divider type="vertical" />
                    <Button shape='round' type="primary" onClick={() => backToTimesheetEdit()} icon={<BackwardFilled />}>
                        Go back
                    </Button>
                    <Divider type="vertical" />
                    <Button size='small' danger type="primary" onClick={() => logOutUser()} icon={<LoginOutlined />}>
                        Log out
                    </Button>
                </Form>
            ) : (
                <Form>
                    <Title level={5}> Sorry, no old records found your profile.</Title>
                    <Divider type="vertical" />
                    <Button size="small" shape="round" type="primary" onClick={() => backToTimesheetEdit()} icon={<BackwardFilled />}>
                        Go back
                    </Button>
                    <Divider type="vertical" />
                    <Button danger type="primary" onClick={() => logOutUser()} icon={<LoginOutlined />}>
                        Log out
                    </Button>
                </Form>
            )}
        </div>

    )
}

export default App