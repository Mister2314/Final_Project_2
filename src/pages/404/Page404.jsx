import React, { Fragment } from 'react'
import Navbar from '../../layout/Header/Navbar/Navbar'
import Footer from '../../layout/Footer/Footer'
import NotFound from '../../components/NotFound/NotFound'

const Page404 = () => {
  return (
<Fragment>
  <Navbar/>
  <NotFound/>
  <Footer/>
</Fragment>  )
}

export default Page404