import React, { useEffect, useState } from 'react'
import 'antd/dist/antd.min.css'
import httpClient from '../httpClient';
import { Button, Divider, Form, Spin, Table, TimePicker, Typography } from 'antd';
import moment from 'moment';
import { User, DataType } from '../types';
import { host, Title } from '..';
import { BackwardFilled, EditTwoTone, HistoryOutlined, LoginOutlined, UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;


const CurrentTimeSheet = () => {
    const [tableData, setTableData] = useState([])
    const [user, setUser] = useState<User | null>(null)
    const [editingRow, setEditingRow] = useState<any | null>(null);
    const [form] = Form.useForm();
    const timeFormat = 'HH:mm';

    const logOutUser = async () => {
        await httpClient.post("//" + host + "/logout")
        window.location.href = "/"
    }

    const timeConfig = {
        rules: [{ type: 'object' as const, required: true, message: 'Please select time!' }],
    };

    var setTableConfig = {
        method: 'post',
        url: 'http://' + host + '/setAttendance',
        data: tableData
    };

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
            await httpClient.get('http://' + host + '/getLatestAttendance')
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
            key: 'punch_in',
            render: (text: any, record: DataType) => {
                if (editingRow === record.id) {
                    return (
                        <Form.Item
                            name="time-picker-in" {...timeConfig}
                            hasFeedback
                            validateStatus="success"
                            initialValue={moment('00:00', timeFormat)}>
                            <TimePicker format={timeFormat} />
                        </Form.Item>
                    );
                } else {
                    return <p>{text}</p>;
                }
            }
        },
        {
            title: 'PUNCH OUT',
            dataIndex: 'punch_out',
            key: 'punch_out',
            render: (text: any, record: DataType) => {
                if (editingRow === record.id) {
                    return (
                        <Form.Item
                            name="time-picker-out" {...timeConfig}
                            hasFeedback
                            validateStatus="success"
                            initialValue={moment('00:00', timeFormat)}>
                            <TimePicker format={timeFormat} />
                        </Form.Item>
                    );
                } else {
                    return <p>{text}</p>;
                }
            },
        },
        {
            title: 'DURATION',
            dataIndex: 'duration',
            key: 'duration',
        },
        {
            'title': 'ACTIONS',
            render: (_: any, record: DataType) => {
                return <>
                    <Button type="dashed" onClick={() => {
                        setEditingRow(record.id);
                        form.setFieldsValue({
                            punch_in: record.punch_in,
                            punch_out: record.punch_out
                        });
                    }}
                        icon={<EditTwoTone />}
                    >Edit</Button>
                    <Button name="save" type="primary" htmlType="submit">
                        Set
                    </Button>
                </>
            }
        }]

    let total = 0
    if (tableData.length !== 0) {
        total = tableData.length / 7
    }


    const onFinish = (values: any) => {
        try {
            if (values !== null && values !== undefined && Object.keys(values).length > 0) {
                let beginningTime = values['time-picker-in'];
                let endTime = values['time-picker-out']
                if (!beginningTime.isBefore(endTime)) {
                    alert('Time validation failed, punch out cannot be before punch in!')
                    return;
                }
            }
            const updatedDataSource: any = [...tableData];

            if (editingRow !== null && updatedDataSource !== undefined) {
                let currEditingRow = editingRow % 7
                let beginningTime = values['time-picker-in']
                let endTime = values['time-picker-out']

                var hoursDiff = endTime.diff(beginningTime, 'hours');

                var minutesDiff = (endTime.diff(beginningTime, 'minutes')) % 60;
                let minutesDiffStr

                if (minutesDiff < 10 && minutesDiff !== null) {
                    minutesDiffStr = '0' + minutesDiff.toString()
                }
                else {
                    minutesDiffStr = minutesDiff.toString()
                }

                let currData = updatedDataSource[currEditingRow - 1]

                updatedDataSource.splice(currEditingRow - 1, 1, {
                    punch_in: values['time-picker-in'].format(timeFormat),
                    punch_out: values['time-picker-out'].format(timeFormat),
                    id: editingRow,
                    date: currData['date'],
                    day: currData['day'],
                    lock: currData['lock'],
                    duration: (hoursDiff + ':' + minutesDiffStr),
                    week_num: currData['week_num']
                });
                setTableData(updatedDataSource);
                setEditingRow(null);
            }
        }
        catch (error: any) {
            console.log("Something went wrong while setting the attendance values.")
        }
    };

    const backToLandingPage = async () => {
        window.location.href = "/"
    }

    const saveInDb = () => {
        httpClient(setTableConfig)
            .then(function (response) {
                setTableData(response.data);
                window.location.reload()
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    const oldRecords = async () => {
        window.location.href = "/allSheets"
    }

    return (
        <div style={{ textAlign: "center", padding: "15px" }}>
            {user != null ? (
                <Title level={4}>Please make sure you update the timesheet for the week, {user.name}</Title>
            ) : (
                <div>
                    Are you logged in?
                </div>
            )}
            {total !== 0 ? (
                <Form form={form} onFinish={onFinish}>
                    <Table
                        bordered
                        rowKey="id"
                        dataSource={tableData}
                        columns={columns}
                        pagination={{ hideOnSinglePage: true }}
                        size="small"

                    />
                    <div style={{ textAlign: "left", marginTop: '1px' }}>
                        <Text>
                            <br />**You wont be able to update the timesheet once the week is over.
                            <br />Please make sure you regularly record your attendance.</Text>
                    </div>
                    <Button shape="round" type="primary" onClick={() => backToLandingPage()} icon={<BackwardFilled />}>
                        Go back
                    </Button>
                    <Divider type="vertical" />
                    <Button size='large' type="primary" shape="round" icon={<HistoryOutlined />} onClick={() => oldRecords()}>
                        Check Old Records
                    </Button>
                    <Divider type="vertical" />
                    <Button size='large' type="primary" shape="round" icon={<UploadOutlined />} onClick={() => saveInDb()}>
                        Submit
                    </Button>
                    <Divider type="vertical" />
                    <Button size='small' danger type="primary" onClick={() => logOutUser()} icon={<LoginOutlined />}>
                        Log out
                    </Button>
                </Form>
            ) : (
                <Spin size="large" />
            )}
        </div>

    )
}

export default CurrentTimeSheet