import { useEffect, useState } from "react";
import { createBookAPI, getCategoryAPI, uploadFileAPI } from "../../../services/api";
import { App, Form, Input, Modal, Row, Col, Divider } from "antd";
import type { FormProps } from 'antd';
import { InputNumber, InputNumberProps, Select } from "antd/lib";
import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { UploadChangeParam } from "antd/es/upload";

interface IProps {
    openModelCreate: boolean;
    setOpenModelCreate: (open: boolean) => void;
    refreshTable: () => void;
}
interface FieldType {
    mainText: string;
    author: string;
    price: number;
    category: string;
    quantity: number;
    thumbnail: any;
    slider : any;
}

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

type UserUploadType = "thumbnail" | "slider";

const CreateBook = (props: IProps) => {

    const getBase64 = (file: FileType): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
    });

    const normFile = (e: any) => {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e?.fileList;
    };

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState("");


    const {message, notification} = App.useApp();
    const [isSubmit, setIsSubmit] = useState<boolean>(false);


    const [fileListThumbnail, setFileListThumbnail] = useState<UploadFile[]>([]);
    const [fileListSliders, setFileListSliders] = useState<UploadFile[]>([]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };


    const uploadButton = (
        <button style={{ border: 0, background: "none" }} type="button">
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>Upload</div>
        </button>
    );

    const { openModelCreate, setOpenModelCreate, refreshTable } = props;
    const [form] = Form.useForm();

    const onChange: InputNumberProps['onChange'] = (value) => {
        console.log('changed', value);
    };

    const formatter: InputNumberProps<number>['formatter'] = (value) => {
        const [start, end] = `${value}`.split('.') || [];
        const v = `${start}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return `$ ${end ? `${v}.${end}` : `${v}`}`;
    };

    const [listCategory, setListCategory] = useState<{ label: string; value: string }[]>([]);
    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getCategoryAPI();
            if(res && res.data){
                console.log('Categories:', res.data);
                const d = res.data.map(item =>{
                    return { label: item, value: item }
                })
                setListCategory(d);
            }
        }
        fetchCategories();
    }, []);

    const beforeUpload = (file: FileType) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Image must smaller than 5MB!');
        }
        return isJpgOrPng && isLt5M || Upload.LIST_IGNORE;
    };

    const handleRemove = (file: UploadFile, type: UserUploadType) => {
        if(type === "thumbnail"){
            setFileListThumbnail([]);
        }else{
            const newSlider = fileListSliders.filter(item => item.uid !== file.uid);
            setFileListSliders(newSlider);
        }
    };

    const handleUploadFile = async (options: RcCustomRequestOptions, type: UserUploadType) => {
        const { onSuccess } = options;
        const file = options.file as FileType;
        const res = await uploadFileAPI(file, 'book');
        console.log('Upload response:', res);
        if(res && res.data){
            message.success('Upload file successfully');
            const uploadedFile: any = {
                uid: file.uid,
                name: res.data.fileUploaded,
                status: 'done',
                url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${res.data.fileUploaded}`
            };
            if(type === "thumbnail"){
                setFileListThumbnail([{...uploadedFile}]);
            }else{
                setFileListSliders((prev) => [...prev, {...uploadedFile}]);
            }
                console.log('Uploaded file from API:', uploadedFile);
            };
        if(onSuccess){
            onSuccess("ok");
        }else{
            message.error('Upload file failed');
        }
    }



    const onFinish : FormProps<FieldType>['onFinish'] = async (values) => {
        message.success('Create book successfully');
        setIsSubmit(true);
        console.log('Success:', values);
        console.log('Thumbnail:', fileListThumbnail);
        console.log('Sliders:', fileListSliders);

        const { mainText, author, price, category, quantity } = values;
        const thumbnail = fileListThumbnail?.[0]?.name ?? '';
        const slider = fileListSliders.map(item => item.name) ?? [];
        const res = await createBookAPI(mainText, author, price, quantity, category, thumbnail, slider);
        if(res.data){
            message.success('Create book successfully');
        }else{
           notification.error({
                message: 'Create book failed',
                description: res.message || 'Something went wrong, please try again later',
                duration: 3
           });
        }
        setIsSubmit(false);
        refreshTable();
        form.resetFields();
        setFileListThumbnail([]);
        setFileListSliders([]);
    };





    return (
        <Modal
            title="Thêm mới sách"
            open={openModelCreate}
            onOk={() => form.submit()}
            onCancel={() => {
                setOpenModelCreate(false);
                form.resetFields();
                setFileListThumbnail([]);
                setFileListSliders([]);
            }}
            okText={isSubmit ? 'Creating...' : 'Create'}
            width={800}
            style={{ top: 20 }}
        >
            <Divider />
            <Form
                form={form}
                name="createBook"
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                {/* Basic Information Section */}
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="Tên sách"
                            name="mainText"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
                        >
                            <Input placeholder="Nhập tên sách" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="Tác giả"
                            name="author"
                            rules={[{ required: true, message: 'Vui lòng nhập tác giả!' }]}
                        >
                            <Input placeholder="Nhập tên tác giả" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item<FieldType>
                            label="Giá tiền"
                            name="price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
                        >
                            <InputNumber<number>
                                style={{ width: '100%' }}
                                defaultValue={1000}
                                formatter={formatter}
                                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                onChange={onChange}
                                placeholder="Nhập giá sách"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item<FieldType>
                            label="Thể loại"
                            name="category"
                            rules={[{ required: true, message: 'Vui lòng chọn thể loại!' }]}
                        >
                            <Select
                                showSearch
                                allowClear
                                placeholder="Chọn thể loại"
                                options={listCategory}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item<FieldType>
                            label="Số lượng"
                            name="quantity"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                        >
                            <InputNumber 
                                style={{ width: '100%' }} 
                                placeholder="Nhập số lượng"
                                min={1}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Hình ảnh sách</Divider>

                {/* Image Upload Section */}
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="Ảnh thumbnail"
                            name="thumbnail"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: 'Vui lòng upload ảnh thumbnail!' }]}
                        >
                            <Upload
                                listType="picture-card"
                                fileList={fileListThumbnail}
                                onPreview={handlePreview}
                                maxCount={1}
                                beforeUpload={beforeUpload} // Prevent auto upload
                                customRequest={(options) => handleUploadFile(options, "thumbnail")}
                                onRemove={(file) => handleRemove(file, "thumbnail")}

                            >
                                {fileListThumbnail.length >= 1 ? null : uploadButton}
                            </Upload>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="Ảnh slider"
                            name="slider"
                            valuePropName="fileList"
                            getValueFromEvent={normFile}
                            rules={[{ required: true, message: 'Vui lòng upload ảnh slider!' }]}
                        >
                            <Upload
                                listType="picture-card"
                                fileList={fileListSliders}
                                onPreview={handlePreview}
                                maxCount={5}
                                multiple={true}
                                beforeUpload={beforeUpload} // Prevent auto upload
                                customRequest={(options) => handleUploadFile(options, "slider")}
                                onRemove={(file) => handleRemove(file, "slider")}
                            >
                                {fileListSliders.length >= 5 ? null : uploadButton}
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row>

                {previewImage && (
                    <Image
                        wrapperStyle={{ display: "none" }}
                        preview={{
                            visible: previewOpen,
                            onVisibleChange: (visible) => setPreviewOpen(visible),
                            afterOpenChange: (visible) => !visible && setPreviewImage(""),
                        }}
                        src={previewImage}
                    />
                )}
            </Form>
        </Modal>
    )
}
export default CreateBook;