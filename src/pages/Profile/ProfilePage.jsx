import React, { Fragment } from 'react'
import Navbar from '../../layout/Header/Navbar/Navbar'
import ProfileSettings from '../../components/ProfileSettings/ProfileSettings'
import Footer from '../../layout/Footer/Footer'

const ProfilePage = () => {
  return (
<Fragment>
    <Navbar/>
    <ProfileSettings/>
</Fragment>  )
}

export default ProfilePage