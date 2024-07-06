import React from 'react';
import { Card } from 'primereact/card'
import './NavBar.css';

const NavBar = () => {
    const name = localStorage.getItem('name') || "Al Hadar"
    
    const togleSideBar = () => {
        const sideBar = document.getElementsByName('sideBar')
        sideBar[0].className === "sideBar" ? sideBar[0].className = "sidebarHidden" : sideBar[0].className = "sideBar" 
    }

    return (
        <div className='navbar'>
            <div className='navbar-top'>
                <button className='buttonMenu' onClick={() => togleSideBar()} style={{height: '100%'}}><i className='pi pi-bars' style={{fontSize:'25px'}}></i></button>
                <div className='profile'>
                    <i className="fas fa-user-circle" style={{fontSize:'25px'}}></i>
                    <p>{name}</p>
                </div>
            </div>
            
            <Card className='menu'>Pengadaan</Card>
        </div>
    )
}

export default NavBar
