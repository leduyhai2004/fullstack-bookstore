import React, { useState } from 'react';
import type { FormProps } from 'antd';
import { App, Button, Checkbox, Form, Input } from 'antd';
import './register.scss';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../../../services/api';

type FieldType = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
};



const RegisterPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const {message} = App.useApp();
  const navigate = useNavigate();

  const onFinish : FormProps<FieldType>['onFinish'] = async (values) => {
  setIsSubmit(true)

  const { fullName, email, password, phone } = values;
  const res = await registerAPI(fullName, email, password, phone);
  if(res.data){
    message.success('Register successfully');
    navigate('/login');
  }else{
    message.error('Register failed');
  }


  console.log('Success:', values);
  // Simulate API call
  setTimeout(() => {
    setIsSubmit(false);
  }, 2000);
  }
  
  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Đăng Ký Tài Khoản</h2>
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



        <Form.Item label={null}>
          <Button type="primary" htmlType="submit" loading={isSubmit}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      {/* <Link to="/login">Already have an account? Login</Link> */}
      <div>
        <Link to="/login">Already have an account? Login</Link>
      </div>
      
      </div>
    </div>
  )
}

export default RegisterPage
