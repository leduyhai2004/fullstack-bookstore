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


export const getUserAPI = (current : number, pageSize : number) => {
    return axios.get<IBackendRes<IModelPaginate<IUserTable>>>(`api/v1/user?current=${current}&pageSize=${pageSize}`);
}

