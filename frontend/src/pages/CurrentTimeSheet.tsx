import React, { useEffect, useState } from 'react'
import 'antd/dist/antd.min.css'
import httpClient from '../httpClient';
import { Button, DatePicker, Divider, Form, Spin, Table, Typography } from 'antd';
import moment from 'moment';
import { User, DataType } from '../types';
import { host, Title } from '..';
import { BackwardFilled, CloseOutlined, EditTwoTone, HistoryOutlined, LoginOutlined, UploadOutlined } from '@ant-design/icons';

const { Text } = Typography;


moment.locale('en-gb', {
    week: {
        dow: 1
    }
})

const CurrentTimeSheet = () => {
    const [tableData, setTableData] = useState([])
    const [user, setUser] = useState<User | null>(null)
    const [editingRow, setEditingRow] = useState<any | null>(null);
    const [form] = Form.useForm();
    // const timeFormat = "DD/MM/YYYY HH:mm";

    const logOutUser = async () => {
        await httpClient.post("//" + host + "/logout")
        window.location.href = "/"
    }

    const timeConfig = {
        rules: [{ type: 'object' as any, required: true, message: 'Please select time!' }],
    }

    // const disabledDate: RangePickerProps['disabledDate'] = current => {
    //     return (current < moment().startOf('week')) || current > moment().endOf('week');
    // }

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
                    console.log(record.date)
                    return (
                        <Form.Item
                            name="time-picker-in" {...timeConfig}
                        >
                            <DatePicker format="DD/MM/YYYY HH:mm"
                                name='punch-in'
                                showTime
                                size='small'
                                disabledDate={(current) => {
                                    let customDate = moment(record.date, "DD/MM/YYYY")
                                    return current && (current < customDate || current > customDate.add(1, 'days'));
                                }} />
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
                        >
                            <DatePicker
                                name='punch-out'
                                format="DD/MM/YYYY HH:mm"
                                showTime
                                size='small'
                                disabledDate={(current) => {
                                    let customDate = moment(record.date, "DD/MM/YYYY")
                                    return (current < customDate || current > customDate.add(2, 'days'));
                                }}

                            />
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
                if (editingRow===null){
                return <>
                    <Button
                        size='small'
                        type="dashed" onClick={
                            () => {
                                setEditingRow(record.id);
                                form.setFieldsValue({
                                    punch_in: record.punch_in,
                                    punch_out: record.punch_out
                                });
                            }}
                        icon={<EditTwoTone />}
                    >Edit</Button>
                    <Divider type='vertical'></Divider></>
                }
                else{
                    return <>
                    <Button
                        danger
                        size='small'
                        type="ghost" onClick={
                            () => {
                                setEditingRow(null);
                            }}
                        icon={<CloseOutlined />}
                    >Cancel</Button>

                    <Divider type='vertical'></Divider>
                    <Button shape='round' name="save" type="primary" htmlType="submit">
                        Set
                    </Button>
                </>
                        }
            }
        }]

    let total = 0
    if (tableData.length !== 0) {
        total = tableData.length / 7
    }

    const onFinish = (values: any) => {
        try {
            if (values !== null && values !== undefined && Object.keys(values).length > 0) {
                console.log(values)
                let beginningTime = values['time-picker-in'];
                let endTime = values['time-picker-out']


                if (!beginningTime.isBefore(endTime)) {
                    alert('Time validation failed, punch out should be after punch in!')
                    return;
                }
            }
            let updatedDataSource: any = [...tableData];

            if (editingRow !== null && updatedDataSource !== undefined) {
                let currEditingRow = editingRow % 7 === 0 ? 7 : editingRow % 7
                let beginningTime = values['time-picker-in']
                let endTime = values['time-picker-out']

                var hoursDiff = endTime.diff(beginningTime, 'hours');

                var minutesDiff = (endTime.diff(beginningTime, 'minutes')) % 60;
                let minutesDiffStr

                if (hoursDiff >= 24) {
                    alert('Time validation failed, please check the dates!')
                    return;
                }

                if (minutesDiff < 10 && minutesDiff !== null) {
                    minutesDiffStr = '0' + minutesDiff.toString()
                }
                else {
                    minutesDiffStr = (minutesDiff).toString()
                }

                let currData = updatedDataSource[currEditingRow - 1]

                updatedDataSource.splice(currEditingRow - 1, 1, {
                    punch_in: values['time-picker-in'].format("HH:mm"),
                    punch_out: values['time-picker-out'].format("HH:mm"),
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
            console.log("Something went wrong while setting the attendance values.", error)
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
                alert("Attendance saved")
            })
            .catch(function (error) {
                alert("Failed to save the data!")
                window.location.reload()
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

