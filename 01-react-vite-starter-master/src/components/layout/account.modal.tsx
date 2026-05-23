import React, { useState, useEffect, useRef } from 'react';
import { useCurrentApp } from '../context/app.context';
import { uploadFileAPI, updateUserAPI, changePasswordAPI } from '../../services/api';
import { Modal, Tabs, Row, Col, Input, Button, Avatar, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './account.modal.scss';

interface IAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const AccountModal: React.FC<IAccountModalProps> = ({ open, onClose }) => {
  const { user, setUser } = useCurrentApp();

  // Navigation state: 'info' or 'password'
  const [activeTab, setActiveTab] = useState<string>('info');

  // Tab 1: Profile states
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUpdatingInfo, setIsUpdatingInfo] = useState<boolean>(false);

  // Tab 2: Password states
  const [oldPass, setOldPass] = useState<string>('');
  const [newPass, setNewPass] = useState<string>('');
  const [isChangingPass, setIsChangingPass] = useState<boolean>(false);

  // File input ref for upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize values when user context changes or modal opens
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || 'aaa');
      setPhone(user.phone || '12345666');
      setAvatar(user.avatar || '');
    }
  }, [user, open]);

  // Clean password fields on tab switch or close
  useEffect(() => {
    setOldPass('');
    setNewPass('');
  }, [activeTab, open]);

  // Avatar URL resolution
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
  const urlAvatar = avatar 
    ? `${backendUrl}/images/avatar/${avatar}` 
    : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // default placeholder if no avatar

  // Upload Avatar handler
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic file validation
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ hỗ trợ tải lên file ảnh!');
      return;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước ảnh đại diện phải nhỏ hơn 2MB!');
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadFileAPI(file, 'avatar');
      if (res && res.data) {
        setAvatar(res.data.fileUploaded);
        message.success('Tải ảnh đại diện lên thành công!');
      } else {
        message.error(res.message || 'Tải ảnh đại diện lên thất bại!');
      }
    } catch (error: any) {
      console.error(error);
      message.error('Đã xảy ra lỗi khi tải ảnh lên!');
    } finally {
      setIsUploading(false);
    }
  };

  // Update profile handler
  const handleUpdateInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      message.error('Không tìm thấy thông tin tài khoản hiện tại!');
      return;
    }

    if (!fullName.trim()) {
      message.error('Vui lòng nhập tên hiển thị!');
      return;
    }

    if (!phone.trim()) {
      message.error('Vui lòng nhập số điện thoại!');
      return;
    }

    try {
      setIsUpdatingInfo(true);
      const res = await updateUserAPI(user.id, fullName, phone, avatar);
      if (res && res.data) {
        // Update user inside React Context
        setUser({
          ...user,
          fullName,
          phone,
          avatar
        });
        message.success('Cập nhật thông tin tài khoản thành công!');
      } else {
        message.error(res.message || 'Cập nhật thông tin tài khoản thất bại!');
      }
    } catch (error: any) {
      console.error(error);
      message.error('Đã xảy ra lỗi khi cập nhật thông tin!');
    } finally {
      setIsUpdatingInfo(false);
    }
  };

  // Change password handler
  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = user?.email || 'test@gmail.com';

    if (!oldPass) {
      message.error('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }

    if (!newPass) {
      message.error('Vui lòng nhập mật khẩu mới!');
      return;
    }

    if (newPass.length < 6) {
      message.error('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }

    try {
      setIsChangingPass(true);
      const res = await changePasswordAPI(email, oldPass, newPass);
      if (res && res.statusCode === 201) { // 201 Created or successfully created change
        message.success('Thay đổi mật khẩu thành công!');
        setOldPass('');
        setNewPass('');
      } else {
        message.error(res.message || 'Thay đổi mật khẩu thất bại!');
      }
    } catch (error: any) {
      console.error(error);
      message.error('Đã xảy ra lỗi khi thay đổi mật khẩu!');
    } finally {
      setIsChangingPass(false);
    }
  };

  // Tab 1 layout: Update Profile
  const renderInfoTab = () => (
    <form onSubmit={handleUpdateInfoSubmit}>
      <Row gutter={[32, 24]} align="middle">
        {/* Left column (30%): Avatar */}
        <Col xs={24} md={8} className="avatar-col">
          <Avatar 
            size={140} 
            src={urlAvatar} 
            className="avatar-circle"
          />
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <Button 
            type="dashed"
            icon={<UploadOutlined />}
            onClick={handleUploadClick}
            loading={isUploading}
            className="btn-outline-custom"
          >
            Upload Avatar
          </Button>
          <span className="avatar-hint">Định dạng JPG, PNG. Tối đa 2MB</span>
        </Col>

        {/* Right column (70%): Inputs */}
        <Col xs={24} md={16}>
          {/* Email Field - Disabled */}
          <div className="form-item-custom">
            <label htmlFor="info-email">
              <span className="required-star">*</span>Email
            </label>
            <Input 
              id="info-email" 
              value={user?.email || 'test@gmail.com'} 
              disabled 
            />
          </div>

          {/* Display Name Field */}
          <div className="form-item-custom">
            <label htmlFor="info-name">
              <span className="required-star">*</span>Tên hiển thị
            </label>
            <Input 
              id="info-name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập tên hiển thị"
              required
            />
          </div>

          {/* Phone Field */}
          <div className="form-item-custom">
            <label htmlFor="info-phone">
              <span className="required-star">*</span>Số điện thoại
            </label>
            <Input 
              id="info-phone" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          {/* Submit Button */}
          <Button 
            htmlType="submit"
            loading={isUpdatingInfo}
            disabled={isUploading}
            className="btn-outline-custom"
            style={{ marginTop: 8 }}
          >
            Cập nhật
          </Button>
        </Col>
      </Row>
    </form>
  );

  // Tab 2 layout: Change Password
  const renderPasswordTab = () => (
    <form onSubmit={handleUpdatePasswordSubmit} className="password-form-container">
      {/* Email Field - Disabled */}
      <div className="form-item-custom">
        <label htmlFor="pass-email">
          <span className="required-star">*</span>Email
        </label>
        <Input 
          id="pass-email" 
          value={user?.email || 'test@gmail.com'} 
          disabled 
        />
      </div>

      {/* Current Password Field */}
      <div className="form-item-custom">
        <label htmlFor="pass-old">
          <span className="required-star">*</span>Mật khẩu hiện tại
        </label>
        <Input.Password 
          id="pass-old" 
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          placeholder="Nhập mật khẩu hiện tại"
          required
        />
      </div>

      {/* New Password Field */}
      <div className="form-item-custom">
        <label htmlFor="pass-new">
          <span className="required-star">*</span>Mật khẩu mới
        </label>
        <Input.Password 
          id="pass-new" 
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          placeholder="Nhập mật khẩu mới"
          required
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="primary"
        htmlType="submit"
        loading={isChangingPass}
        className="btn-primary-custom"
        style={{ marginTop: 8 }}
      >
        Xác nhận
      </Button>
    </form>
  );

  const tabItems = [
    {
      key: 'info',
      label: 'Cập nhật thông tin',
      children: renderInfoTab(),
    },
    {
      key: 'password',
      label: 'Đổi mật khẩu',
      children: renderPasswordTab(),
    },
  ];

  return (
    <Modal
      title="Quản lý tài khoản"
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      className="custom-account-modal"
      centered
      destroyOnClose
    >
      <Tabs 
        activeKey={activeTab} 
        onChange={(key) => setActiveTab(key)} 
        items={tabItems}
      />
    </Modal>
  );
};

export default AccountModal;
