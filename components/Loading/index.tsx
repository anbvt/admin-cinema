import {BarLoader} from "react-spinners";

const LoadingComponent = () => {
    return (
        <div className="container flex justify-center items-center" style={{height: 700}}>
            <BarLoader color="#36d7b7"/>
        </div>
    )
}
export default LoadingComponent;