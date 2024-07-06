import React from 'react'
import './SideBar.css'
import { LogoMedichain } from '../../assets';
import { useLocation, useNavigate } from 'react-router-dom'

const SideBar = () => {
    const location = useLocation();
    const currentLocation = location.pathname.split('/')[1];
    const navigate = useNavigate();

    const userLogout = () => {
        setTimeout(() => {
            localStorage.removeItem('accessToken')
            navigate('/')
        }, 200)
    }

    return (
        <div className='sideBar' name="sideBar">
            <img src={LogoMedichain} alt="Logo-Medichain" height="60px" />
            <div className='sidebarMenu'>
                <a href="/dashboard">
                    <div className={currentLocation === "dashboard" ? "activeMenu" : "inactiveMenu"}>Dashboard</div>
                </a>
                <a href="/master-supplier">
                    <div className={currentLocation === "master-supplier" ? "activeMenu" : "inactiveMenu"}>Master Supplier</div>
                </a>
                <a href="/master-po">
                    <div className={currentLocation === "master-po" ? "activeMenu" : "inactiveMenu"}>Master PO</div>
                </a>
                <a href="/purchase-order">
                    <div className={currentLocation === "purchase-order" ? "activeMenu" : "inactiveMenu"}>Purchase Order</div>
                </a>
                <a href="/master-ro">
                    <div className={currentLocation === "master-ro" ? "activeMenu" : "inactiveMenu"}>Master RO</div>
                </a>
                <a href="/receiving-order">
                    <div className={currentLocation === "receiving-order" ? "activeMenu" : "inactiveMenu"}>Receiving Order</div>
                </a>
            </div>
            <div className='logoutContainer'>
                <button className="logoutButton" onClick={userLogout}>Logout</button>
            </div>
        </div>
    )
}

export default SideBar
