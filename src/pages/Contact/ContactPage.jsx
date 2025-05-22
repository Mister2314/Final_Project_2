import React, { Fragment, useEffect } from 'react'
import Navbar from '../../layout/Header/Navbar/Navbar'
import Footer from '../../layout/Footer/Footer'
import Contact from '../../components/Contact/Contact'
import useTitle from '../../UseTitle/UseTitle'

const ContactPage = () => {
    useTitle();
    
    // For debugging purposes - verify component mounting
    useEffect(() => {
        console.log("ContactPage mounted");
    }, []);
    
    return (
        <Fragment>
            <Navbar />
            <Contact />
            <Footer />
        </Fragment>
    )
}

export default ContactPage