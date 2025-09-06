
import {Avatar, Descriptions, Drawer } from 'antd';
import dayjs from 'dayjs';

interface IProps  {
    openViewDetail: boolean,
    setOpenViewDetail: (open: boolean) => void,
    dataViewDetail: IUserTable | null,
    setDataViewDetail: (data: IUserTable | null) => void
};
const DetailUser = (props: IProps) => {

    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }
    return (
        <>
            <Drawer
                title="Basic Drawer"
                closable={{ 'aria-label': 'Close Button' }}
                onClose={onClose}
                open={openViewDetail}
                width={"50vw"}
            >
                <Descriptions title="User Info" bordered column={2}>
                <Descriptions.Item label="Id">{dataViewDetail?._id}</Descriptions.Item>
                <Descriptions.Item label="Full name">{dataViewDetail?.fullName}</Descriptions.Item>
                <Descriptions.Item label="Phone number">{dataViewDetail?.phone}</Descriptions.Item>
                <Descriptions.Item label="Email">{dataViewDetail?.email}</Descriptions.Item>
                <Descriptions.Item label="Role">{dataViewDetail?.role}</Descriptions.Item>
                <Descriptions.Item label="Avatar">
                    <Avatar src={`http://localhost:8080/images/avatar/${dataViewDetail?.avatar}`} size={64} />
                </Descriptions.Item>
                <Descriptions.Item label="Created at">{dayjs(dataViewDetail?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="Updated at">{dayjs(dataViewDetail?.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                </Descriptions>
            </Drawer>
        </>
    );
};

export default DetailUser;
