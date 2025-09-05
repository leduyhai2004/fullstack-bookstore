import type { FormProps } from 'antd';
import { App, Button, Checkbox, Form, Input } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI } from '../../../services/api';
import { useCurrentApp } from '../../../components/context/app.context';

type FieldType = {
  username: string;
  password: string;
  remember?: boolean;
};



const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo);
};
const LoginPage = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const {message} = App.useApp();
  const {setIsAuthenticated, setUser} = useCurrentApp();

  const navigate = useNavigate();
  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    setIsSubmit(true);
    const { username, password } = values;
    const res = await loginAPI(username, password);

    if(res?.data){
      setUser(res.data.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', res.data.access_token);
      message.success('Login successful');
      navigate('/home');
    } else {
      message.error('Login failed');
    }

  console.log('Success:', values);
};
  return (
    <div className="register-page">
        <div className="register-container">
           <h2 className="register-title">Đăng nhập</h2>
            <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
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

          <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit" loading={isSubmit}>
              Submit
            </Button>
          </Form.Item>
        </Form>
              <div>
                <Link to="/register">Don't have an account? Register</Link>
              </div>
        </div>
    </div>
  )
}

export default LoginPage
