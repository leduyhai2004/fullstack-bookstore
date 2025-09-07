import { App, Form, FormProps, Input, Modal, Table } from "antd";
import { useEffect, useState } from "react";
import { updateUserAPI } from "../../../services/api";

interface IProps  {
    openUpdateUser: boolean,
    setOpenUpdateUser: (open: boolean) => void,
    dataUpdateUser: IUserTable | null,
    setDataUpdateUser: (data: IUserTable | null) => void,
    refreshTable: () => void
};

interface FieldType {
    _id : string;
    fullName : string;
    email : string;
    phone : string;
}
const UpdateUser = (props : IProps) => {
    const { openUpdateUser, setOpenUpdateUser, dataUpdateUser, setDataUpdateUser , refreshTable} = props;
    const [isSubmit , setIsSubmit] = useState<boolean>(false);
    const {message, notification} = App.useApp();

    const [form] = Form.useForm();
    
    // Debug để kiểm tra dữ liệu
    useEffect(() => {
        console.log('dataUpdateUser:', dataUpdateUser);
        if (dataUpdateUser) {
            // Thêm setTimeout để đảm bảo form đã được render
                form.setFieldsValue({
                    _id: dataUpdateUser._id,
                    fullName: dataUpdateUser.fullName,
                    email: dataUpdateUser.email,
                    phone: dataUpdateUser.phone,
                });
        }
    }, [dataUpdateUser, form]);

    // Reset form khi đóng modal
    useEffect(() => {
        if (!openUpdateUser) {
            form.resetFields();
        }
    }, [openUpdateUser, form]);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const { _id, fullName, phone } = values;
        setIsSubmit(true);
        try {
            const res = await updateUserAPI(_id, fullName, phone);
            if (res && res.data) {
                notification.success({
                    message: 'Update User',
                    description: `User ${res.data.fullName} updated successfully`,
                    duration: 5,
                });
                form.resetFields();
                setOpenUpdateUser(false);
                setDataUpdateUser(null);
                refreshTable();
            } else {
                notification.error({
                    message: 'Update Failed',
                    description: 'Failed to update user',
                    duration: 5,
                });
            }
        } catch (error) {
            console.error('Update error:', error);
            notification.error({
                message: 'Update Failed',
                description: 'An error occurred while updating user',
                duration: 5,
            });
        } finally {
            setIsSubmit(false);
        }
    }

    return (
        <>
        <Modal
        title="Update User"
        open={openUpdateUser}
        onOk={() => {
            form.submit();
        }}
        onCancel={() => {
            setOpenUpdateUser(false);
            form.resetFields();
            setDataUpdateUser(null);
        }}
        confirmLoading={isSubmit}
      >
        <Form
        form={form}
          name="basic"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >

            <Form.Item<FieldType> name="_id" hidden>
                <Input type="hidden" />
            </Form.Item>


            <Form.Item<FieldType>
            label="fullName"
            name="fullName"
            rules={[{ required: true, message: 'Please input your fullName!' }]}
            >
            <Input />
            </Form.Item>

            <Form.Item<FieldType>
            label="Email"
            name="email"
            rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please input a valid email!' },
            ]}
            >
            <Input disabled />
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
    );
};

export default UpdateUser;
