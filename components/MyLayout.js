import Header from './Header'
import Head from 'next/head'
import NProgress from 'nprogress'
import Router from 'next/router'

Router.onRouteChangeStart = () => {
  console.log("ROUTE STARTED")
  NProgress.start()}
Router.onRouteChangeComplete = () => {console.log("route done")
NProgress.done()}
Router.onRouteChangeError = () => NProgress.done()

const layoutStyle = {
  margin: '0 auto',
  maxWidth: 1280,
  padding: 20,
}

const Layout = (props) => (
  <div style={layoutStyle}>
    <Head>
      <title>HSBC RoboAdvisor</title>
    </Head>
    <Header auth={props.auth} page={props.page}/>
    {props.children}
  </div>
)

export default Layout