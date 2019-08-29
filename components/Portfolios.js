import React, { Component } from 'react'
import { Image, Grid, Menu, Segment, Header } from 'semantic-ui-react'

import PortfolioPagination from './PortfolioPagination'
import { getPortfolios } from '../lib/api'
import Router, { withRouter } from 'next/router'

const PortfolioItem = (props) => {
    const { active, id, holdings, onClick, funds } = props

    const portfolioValue = holdings.reduce((a, c) => {
        const { price } = funds.find(fund => {
            return fund.fundId === c.fundId
        })

        console.log(funds)
        console.log(price)
        console.log(c)

        return a + (c.units * price.amount)
    }, 0)
    const formattedValue = new Intl.NumberFormat('en-US',
        { style: 'currency', currency: 'USD' }
    ).format(portfolioValue)

    return (
        <Menu.Item
            onClick={onClick}
            name='promotions'
            active={active}
        >
            <Header as='h4'>{`Portfolio #${id}`}</Header>
            <p>{formattedValue}</p>
        </Menu.Item>
    )
}

class Portfolios extends Component {
    constructor(props) {
        super(props)

        const portfolioId = parseInt(props.router.query.portfolio) || props.portfolios[0].id

        this.state = {
            selectedPortfolioId: portfolioId
        }

        this.selectPortfolio = this.selectPortfolio.bind(this)
    }

    componentDidUpdate(prevProps) {
        const { router: {query}, portfolios } = this.props
        // verify props have changed to avoid an infinite loop
        if (query.portfolio !== prevProps.router.query.portfolio) {
            
            this.setState({ selectedPortfolioId: parseInt(query.portfolio) || portfolios[0].id })
            // fetch data based on the new query
        }
    }

    selectPortfolio(portfolioId, event) {
        const href = `/?portfolio=${portfolioId}`
        const as = href
        Router.push(href, as)
        this.setState({ selectedPortfolioId: portfolioId })
    }

    render() {
        const { portfolios, funds } = this.props
        const { selectedPortfolioId } = this.state

        const selectedPortfolio = portfolios.find(portfolio => {
            return portfolio.id === selectedPortfolioId
        })

        return (
            <Segment>
                <Grid>
                    <Grid.Column width={4} >
                        <Menu pointing vertical fluid>
                            {portfolios.map(portfolio => (
                                <PortfolioItem funds={funds} onClick={this.selectPortfolio.bind(this, portfolio.id)} active={selectedPortfolioId === portfolio.id} key={portfolio.id} {...portfolio} />
                            ))}
                        </Menu>
                    </Grid.Column>
                    
                    <Grid.Column width={12}>
                        {selectedPortfolio ? (
                        <PortfolioPagination portfolio={selectedPortfolio} funds={funds} key={selectedPortfolioId}/>
                        ) : (
                        <p>Portfolio not found</p>
                        )}
                    </Grid.Column>
                </Grid>
            </Segment>
        )
    }
}

export default withRouter(Portfolios)
