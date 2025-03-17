
import React from 'react'
import Header from '../common-pages/Header'
import { Outlet } from 'react-router-dom'
import Footer from '../common-pages/Footer'

const Layout = () =>{
    return(
       <div className='page_container'>
        {/* <Header /> */}
       <div className='page-content'>
       <Outlet />
       </div>
       {/* <Footer /> */}
       </div>
    )
}

export default Layout