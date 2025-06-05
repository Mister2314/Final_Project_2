import React, { Fragment } from 'react'
import Navbar from '../../layout/Header/Navbar/Navbar'
import Footer from '../../layout/Footer/Footer'
import Faq from '../../components/FAQ/Faq'

const FaqPage = () => {
  return (
    <Fragment>
      <Navbar/>
      <Faq/>
      <Footer/>
    </Fragment>
  )
}

export default FaqPage