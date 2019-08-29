import React, { Component } from 'react'
import { getPortfolioSettings } from '../lib/api'
import { Image, Grid, Menu, Segment, Header, List, Button } from 'semantic-ui-react'
import PortfolioDetails from './PortfolioDetails'
import Router, { withRouter } from 'next/router'

import PortfolioRecommendations from './PortfolioRecommendations'
import PortfolioSetup from './PortfolioSetup'

class PortfolioPagination extends Component {

  constructor(props){
    super(props)

    this.state = {
      page: "LOADING",
      args: {}
    }

    this.switchPage = this.switchPage.bind(this)
    this.changeSettings = this.changeSettings.bind(this)
  }

  async componentDidMount() {
    const { portfolio, funds } = this.props
    const portfolioSettings = await getPortfolioSettings(this.props.portfolio.id);
    setTimeout(() => {
      if (portfolioSettings == "" || portfolio.holdings.length > portfolioSettings.allocations.length) {
        this.setState({page: "SETUP"})
      } else {
        this.setState({page: "MAIN", portfolioSettings})
      }
    }, 100)
  }

  switchPage(page, args = {}) {
    this.setState({page, args})
  }

  changeSettings(portfolioSettings) {
    this.setState({portfolioSettings})
  }

  render() {
    const { portfolio, funds } = this.props
    const { page, portfolioSettings, args } = this.state

    switch(page) {
      case "LOADING":
        return (
          <Segment loading>
            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
            <Image src='https://react.semantic-ui.com/images/wireframe/short-paragraph.png' />
          </Segment>
        )
      case "MAIN":
        return (
          <PortfolioDetails portfolio={portfolio} funds={funds}
            title={`Portfolio #${portfolio.id}`} switchPage={this.switchPage} args={args}/>
        )
      case "RECOMMENDATIONS":
          return (
            <PortfolioRecommendations portfolio={portfolio} funds={funds} switchPage={this.switchPage}/>
          )
      case "SETUP" :
            return (
              <PortfolioSetup portfolio={portfolio} funds={funds} switchPage={this.switchPage} changeSettings={this.changeSettings}/>
            )
      case "SETUP_MODIFY" :
            return (
              <PortfolioSetup portfolio={portfolio} funds={funds} switchPage={this.switchPage} settings={portfolioSettings} changeSettings={this.changeSettings}/>
            )
      default:
        return (
          <p>Invalid page</p>
        ) 
    }
  }
}

export default withRouter(PortfolioPagination)
