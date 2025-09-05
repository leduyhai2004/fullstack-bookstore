import { Button, Result } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useCurrentApp } from "../context/app.context";

interface IProps {
    children: React.ReactNode;
}

const ProtectedRoute = (props :IProps) => {
    const { isAuthenticated, user } = useCurrentApp();
    const location = useLocation();
    console.log(location.pathname);
    if(!isAuthenticated){
        return (
            <Result
                status="404"
                title="404"
                subTitle="Sorry, you are not authorized to access this page."
                extra={<Button type="primary"><Link to="/login">Back to Login</Link></Button>}
            />
        )
    }
    const isAdminRoute = location.pathname.includes('/admin');
    if(isAdminRoute && isAuthenticated) {
        const role = user?.role;
        if(role ==="USER"){
        return (
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={<Button type="primary"><Link to="/login">Back to Login</Link></Button>}
            />
        )
        }

    }
    return(
        <>
        {props.children}
        </>
    )
};
export default ProtectedRoute;
