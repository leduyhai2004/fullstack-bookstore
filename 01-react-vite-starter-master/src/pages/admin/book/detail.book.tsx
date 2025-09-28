
import { PlusOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import {Avatar, Descriptions, Divider, Drawer, Image, Upload } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import type { GetProp, UploadFile, UploadProps } from 'antd';
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });


interface IProps  {
    openViewDetail: boolean,
    setOpenViewDetail: (open: boolean) => void,
    dataViewDetail: IBookTable | null,
    setDataViewDetail: (data: IBookTable | null) => void
};
const DetailBook = (props: IProps) => {

    const { openViewDetail, setOpenViewDetail, dataViewDetail, setDataViewDetail } = props;
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if(dataViewDetail){
            let imgThumbnail : any = {}, imgSliders : any[] = [];
            if(dataViewDetail.thumbnail){
                imgThumbnail = {
                    uid: uuidv4(),
                    name: 'image.png',
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${dataViewDetail.thumbnail}`
                }
            }
            if(dataViewDetail.slider && dataViewDetail.slider.length > 0){
                imgSliders = dataViewDetail.slider.map((item) => ({
                    uid: uuidv4(),
                    name: 'image.png',
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${item}`
                }))
            }
            setFileList([imgThumbnail, ...imgSliders]);
        }
    }, [dataViewDetail])

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );
    const onClose = () => {
        setOpenViewDetail(false);
        setDataViewDetail(null);
    }
    return (
            <Drawer
                title="Basic Drawer"
                closable={{ 'aria-label': 'Close Button' }}
                onClose={onClose}
                open={openViewDetail}
                width={"50vw"}
            >
                <Descriptions title="User Info" bordered column={2}>
                <Descriptions.Item label="Id">{dataViewDetail?._id}</Descriptions.Item>
                <Descriptions.Item label="Main Text">{dataViewDetail?.mainText}</Descriptions.Item>
                <Descriptions.Item label="Author">{dataViewDetail?.author}</Descriptions.Item>
                <Descriptions.Item label="Price">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(dataViewDetail?.price || 0)}
                </Descriptions.Item>
                <Descriptions.Item label="Quantity">{dataViewDetail?.quantity}</Descriptions.Item>
                <Descriptions.Item label="Category">{dataViewDetail?.category}</Descriptions.Item>
                <Descriptions.Item label="Created at">{dayjs(dataViewDetail?.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                <Descriptions.Item label="Updated at">{dayjs(dataViewDetail?.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
                </Descriptions>
                <Divider orientation='left'>Ảnh sách</Divider>
                      <Upload
                        action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}
                        showUploadList={{ showRemoveIcon: false }}
                    >
                        {fileList.length >= 8 ? null : uploadButton}
                        </Upload>
                        {previewImage && (
                            <Image
                            wrapperStyle={{ display: 'none' }}
                            preview={{
                                visible: previewOpen,
                                onVisibleChange: (visible) => setPreviewOpen(visible),
                                afterOpenChange: (visible) => !visible && setPreviewImage(''),
                            }}
                            src={previewImage}
                            />
                        )}
            </Drawer>
    );
};

export default DetailBook;
