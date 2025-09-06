import { App, Form, Input, Modal } from "antd";
import type { FormProps } from 'antd';
import { createUserAPI } from "../../../services/api";
import { useState } from "react";

interface IProps {
    openModelCreate: boolean;
    setOpenModelCreate: (open: boolean) => void;
    refreshTable: () => void;
}

interface FieldType {
    fullName: string;
    password: string;
     email: string;
    phone: string;
   
}
const CreateUser = (props : IProps) => {
    const { openModelCreate, setOpenModelCreate, refreshTable } = props;
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const {message, notification} = App.useApp();
    const [form] = Form.useForm();

    const onFinish : FormProps<FieldType>['onFinish'] = async (values) => {
        setIsSubmit(true)

        const { fullName, email, password, phone } = values;
        const res = await createUserAPI(fullName, email, password, phone);
        if(res.data){
            message.success('Create user successfully');
            setOpenModelCreate(false);
            refreshTable();
            form.resetFields();
        }else{
           notification.error({
                message: 'Create user failed',
                description: res.message || 'Something went wrong, please try again later',
                duration: 3
           });
        }


        console.log('Success:', values);
        // Simulate API call
        setTimeout(() => {
            setIsSubmit(false);
        }, 2000);
    }
    return (
        <div>
            <>
            <Modal
                title="Basic Modal"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={openModelCreate}
                onOk={() => form.submit()}
                onCancel={() => {setOpenModelCreate(false); form.resetFields();}}
                okText={isSubmit ? 'Creating...' : 'Create'}
            >
        <Form
          name="basic"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
            <Form.Item<FieldType>
            label="fullName"
            name="fullName"
            rules={[{ required: true, message: 'Please input your fullName!' }]}
            >
            <Input />
            </Form.Item>

            <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
            >
            <Input.Password />
            </Form.Item>

            <Form.Item<FieldType>
            label="Email"
            name="email"
            rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please input a valid email!' },
            ]}
            >
            <Input />
            </Form.Item>

            <Form.Item<FieldType>
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please input your phone number!' }]}
            >
            <Input />
            </Form.Item>

      </Form>
            </Modal>
            </>
        </div>
    );
};

export default CreateUser;
