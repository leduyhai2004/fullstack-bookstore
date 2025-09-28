import axios  from "../services/axios.customize";

export const loginAPI = (username : string, password: string) =>{
    return axios.post<IBackendRes<ILogin>>('api/v1/auth/login', { username, password });
}

export const registerAPI = ( fullName: string,email: string,password : string, phone : string) => {
    return axios.post<IBackendRes<IRegister>>('api/v1/user/register', { fullName,email,password,  phone });
}


export const fetchAccountAPI = () => {
    return axios.get<IBackendRes<IFetchAccount>>(`api/v1/auth/account`, {
        headers:{
            delay : 1000
        }
    });
}

//logout
export const logoutAPI = () => {
    return axios.post<IBackendRes<IRegister>>('api/v1/auth/logout');
}

export const getUserAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(`api/v1/user?${query}`);
}

//create user
export const createUserAPI = ( fullName: string,email: string,password : string, phone : string) => {
    return axios.post<IBackendRes<IRegister>>('api/v1/user', { fullName,email,password,  phone });
}

export const createListUserAPI = ( data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
}[]) => {
    return axios.post<IBackendRes<IResponseImport>>('api/v1/user/bulk-create', data);
}


export const updateUserAPI = ( _id: string, fullName : string, phone : string ) => {
    return axios.put<IBackendRes<IRegister>>(`api/v1/user`, { _id ,fullName, phone });
}

export const deleteUserAPI = ( _id: string ) => {
    return axios.delete<IBackendRes<IRegister>>(`api/v1/user/${_id}`);
}


//books
export const getBookAPI = (query: string) => {
    return axios.get<IBackendRes<IModelPaginate<IBookTable>>>(`api/v1/book?${query}`);
}

export const getCategoryAPI = () => {
    return axios.get<IBackendRes<string[]>>(`api/v1/database/category`);
}

export const uploadFileAPI = (fileImg : any , folder : string) => {
    const formData = new FormData();
    formData.append('fileImg', fileImg);
    formData.append('folder', folder);

    return axios<IBackendRes<{
        fileUploaded: string;
    }>>({
        method: 'post',
        url: 'api/v1/file/upload',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
            "upload-type" : folder
        },
    });
}

export const createBookAPI = (
    mainText : string,
    author : string,
    price : number,
    quantity : number,
    category : string,
    thumbnail : string,
    slider : string[]
 ) => {
    return axios.post<IBackendRes<IRegister>>('api/v1/book', { mainText, author, price, quantity, category, thumbnail, slider });
}

export const updateBookAPI = (
    _id: string,
    mainText: string,
    author: string,
    price: number,
    quantity: number,
    category: string,
    thumbnail: string,
    slider: string[]
) => {
    return axios.put<IBackendRes<IRegister>>(`api/v1/book/${_id}`, { mainText, author, price, quantity, category, thumbnail, slider });
}

export const deleteBookAPI = ( _id: string ) => {
    return axios.delete<IBackendRes<IRegister>>(`api/v1/book/${_id}`);
}
