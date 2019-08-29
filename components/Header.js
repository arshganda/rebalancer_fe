import Link from 'next/link'
import { signOut } from '../lib/auth'
import React, { Component } from 'react'
import 'semantic-ui-css/semantic.min.css';

import { Menu } from 'semantic-ui-react'

const fooDBStyle = {
  marginLeft: '8px'
}

const logoStyle = {
  width: '30px'
}

export default class Header extends Component {
  render() {

    return (
      <Menu stackable>
        <Menu.Item>
          <img style={logoStyle} src='https://i.imgur.com/E5v9rCu.png' /> <span style={fooDBStyle}><b>RoboAdvisor</b></span>
        </Menu.Item>

          <Link href="/">
            <Menu.Item active={this.props.page == 'HOME'}
              name='home'
            >
              Home
        </Menu.Item>
          </Link>
          
        {this.props.auth ?
          <>
            <Menu.Item
              name='sign-out'
              onClick={signOut}
            >Sign out</Menu.Item>
             <Menu.Menu position='right'>
            <Menu.Item>
            <img style={logoStyle} src='https://gladstoneentertainment.com/wp-content/uploads/2018/05/avatar-placeholder.gif' /> <span style={fooDBStyle}><b>John Smith</b></span>
              </Menu.Item>
            </Menu.Menu>
          </> :
          <>
            <Link href="/user/signin">
              <Menu.Item active={this.props.page == 'SIGNIN'}
                name='sign-in'
              >Sign in</Menu.Item>
            </Link>
          </>
        }

      </Menu>
    )
  }
}
